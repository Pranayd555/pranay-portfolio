import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, AfterViewInit, Component, DestroyRef, effect, ElementRef, inject, input, NgZone, OnDestroy, PLATFORM_ID, ViewChild } from '@angular/core';
import * as THREE from 'three';

export type AvatarState = 'idle' | 'listening' | 'talking';

@Component({
  selector: 'app-talk-animation-bg',
  templateUrl: './talk-animation-bg.html',
  styleUrls: ['./talk-animation-bg.css'],
})
export class TalkAnimationBg {

  @ViewChild('rendererCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container', { static: false }) containerRef!: ElementRef<HTMLDivElement>;
  readonly platformId = inject(PLATFORM_ID);
  readonly destroyRef = inject(DestroyRef);

  state = input<AvatarState>('listening');

  isWebGLSupported = false;

  // Interpolation targets & current values
  private currentTransition = 0.0;
  private targetTransition = 0.0;

  private currentAmplitude = 0.6;
  private targetAmplitude = 0.6;

  private currentFrequency = 1.2;
  private targetFrequency = 1.2;

  private currentGlow = 1.0;
  private targetGlow = 1.0;

  // Color states
  private currentC1 = new THREE.Color(0x00ffff);
  private currentC2 = new THREE.Color(0x0080ff);
  private currentGlowColor = new THREE.Color(0x8a2be2);

  private targetC1 = new THREE.Color(0x00ffff);
  private targetC2 = new THREE.Color(0x0080ff);
  private targetGlowColor = new THREE.Color(0x8a2be2);

  private transitionSpeed = 2.5; // lerp rate

  // Three.js runtime
  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private particleGeometry?: THREE.BufferGeometry;
  private particleMaterial?: THREE.ShaderMaterial;
  private particleSystem?: THREE.Points;
  private clock?: THREE.Clock;
  private animationFrameId = 0;
  private resizeObserver?: ResizeObserver;

  constructor(private ngZone: NgZone) {
    try {
      const canvas = document.createElement('canvas');
      const supported = !!(
        (window as any).WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
      this.isWebGLSupported = supported;
    } catch (e) {
      this.isWebGLSupported = false;
    }
    effect(()=> {
    this.applyStateTargets(this.state());
    })
    afterNextRender(() => {
            if (isPlatformBrowser(this.platformId)) {
                
              if (!this.isWebGLSupported) return;
              if (!this.canvasRef?.nativeElement || !this.containerRef?.nativeElement) return;
              this.initializeThree();
            }
        });

        this.destroyRef.onDestroy(() => {
              this.teardown();
        });
  }


  private applyStateTargets(state: AvatarState) {
    switch (state) {
      case 'idle':
        this.targetTransition = 0.0;
        this.targetAmplitude = 0.6;
        this.targetFrequency = 1.2;
        this.targetGlow = 1.8;
        this.targetC1.set(0x00ffff);
        this.targetC2.set(0x0080ff);
        this.targetGlowColor.set(0x8a2be2);
        break;
      case 'talking':
        this.targetTransition = 0.0;
        this.targetAmplitude = 1.2;
        this.targetFrequency = 2.4;
        this.targetGlow = 1.35;
        this.targetC1.set(0xff0080);
        this.targetC2.set(0xff00ff);
        this.targetGlowColor.set(0xff6b6b);
        break;
      case 'listening':
        this.targetTransition = 1.0;
        this.targetAmplitude = 0.2;
        this.targetFrequency = 0.8;
        this.targetGlow = 1.4;
        this.targetC1.set(0x00ffff);
        this.targetC2.set(0x00ff88);
        this.targetGlowColor.set(0x008888);
        break;
    }
  }

  private initializeThree() {
    const canvas = this.canvasRef?.nativeElement;
    const container = this.containerRef?.nativeElement;

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x000000, 0.05);

    this.camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
    this.camera.position.set(0, 1.8, 5.5);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    // Particle system
    const segments = 110;
    const numParticles = segments * segments;
    this.particleGeometry = new THREE.BufferGeometry();

    const positions = new Float32Array(numParticles * 3);
    const gridCoords = new Float32Array(numParticles * 2);
    let index = 0;
    for (let i = 0; i < segments; i++) {
      const u = i / (segments - 1);
      for (let j = 0; j < segments; j++) {
        const v = j / (segments - 1);
        positions[index * 3] = 0;
        positions[index * 3 + 1] = 0;
        positions[index * 3 + 2] = 0;
        gridCoords[index * 2] = u;
        gridCoords[index * 2 + 1] = v;
        index++;
      }
    }

    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleGeometry.setAttribute('aGridCoords', new THREE.BufferAttribute(gridCoords, 2));

    const vertexShader = `
      uniform float uTime;
      uniform float uTransition;
      uniform float uAmplitude;
      uniform float uFrequency;
      attribute vec2 aGridCoords;
      varying vec2 vGridCoords;
      varying vec3 vPosition;
      varying float vHeight;
      void main() {
        vGridCoords = aGridCoords;
        vec3 wavePos = vec3((aGridCoords.x - 0.5) * 8.0, 0.0, (aGridCoords.y - 0.5) * 8.0);
        float waveSpeed = uTime * 2.5;
        float waveDisp = sin(wavePos.x * uFrequency + waveSpeed) * cos(wavePos.z * (uFrequency * 0.8) + waveSpeed * 0.7) * uAmplitude;
        waveDisp += sin(wavePos.x * (uFrequency * 2.2) - waveSpeed * 1.5) * 0.2 * uAmplitude;
        waveDisp += cos(wavePos.z * (uFrequency * 1.5) + waveSpeed * 1.1) * 0.15 * uAmplitude;
        float theta = aGridCoords.x * 6.28318530718;
        float ringRadius = 2.8 + aGridCoords.y * 0.4;
        float orbitSpeed = uTime * 0.8;
        float thetaOrbit = theta + orbitSpeed;
        vec3 ringPos = vec3(
          ringRadius * cos(thetaOrbit),
          sin(theta * 3.0 + uTime * 2.0) * 0.15,
          ringRadius * sin(thetaOrbit)
        );
        vec3 pos = mix(wavePos + vec3(0.0, waveDisp, 0.0), ringPos, uTransition);
        vPosition = pos;
        vHeight = pos.y;
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = (14.0 / -mvPosition.z) * (1.0 + 0.35 * sin(uTime * 3.0 + aGridCoords.x * 12.0));
      }
    `;

    const fragmentShader = `
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uGlowColor;
      uniform float uGlow;
      varying vec2 vGridCoords;
      varying vec3 vPosition;
      varying float vHeight;
      void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        if (dist > 0.5) discard;
        vec3 baseColor = mix(uColor1, uColor2, vGridCoords.x);
        float glowIntensity = 0.07 / (dist + 0.015);
        glowIntensity = clamp(glowIntensity, 0.0, 1.0);
        glowIntensity = pow(glowIntensity, 1.4);
        vec3 finalColor = mix(baseColor, uGlowColor, dist * 2.0) * glowIntensity * uGlow;
        float alpha = smoothstep(0.5, 0.05, dist) * glowIntensity * 0.75 * uGlow;
        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    this.particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uTransition: { value: this.currentTransition },
        uAmplitude: { value: this.currentAmplitude },
        uFrequency: { value: this.currentFrequency },
        uColor1: { value: new THREE.Color() },
        uColor2: { value: new THREE.Color() },
        uGlowColor: { value: new THREE.Color() },
        uGlow: { value: this.currentGlow },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.particleSystem = new THREE.Points(this.particleGeometry, this.particleMaterial);
    this.scene.add(this.particleSystem);

    this.clock = new THREE.Clock();

    // Resize observer
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(container);

    // Start loop outside Angular for performance
    this.ngZone.runOutsideAngular(() => this.animate());
  }

  private onResize() {
    if (!this.camera || !this.renderer || !this.containerRef) return;
    const container = this.containerRef.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }

  private animate = () => {
    if (!this.clock || !this.renderer || !this.scene || !this.camera || !this.particleMaterial) return;
    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    // Interpolate values
    this.currentTransition = THREE.MathUtils.lerp(this.currentTransition, this.targetTransition, delta * this.transitionSpeed);
    this.currentAmplitude = THREE.MathUtils.lerp(this.currentAmplitude, this.targetAmplitude, delta * this.transitionSpeed);
    this.currentFrequency = THREE.MathUtils.lerp(this.currentFrequency, this.targetFrequency, delta * this.transitionSpeed);
    this.currentGlow = THREE.MathUtils.lerp(this.currentGlow, this.targetGlow, delta * this.transitionSpeed);

    this.currentC1.lerp(this.targetC1, Math.min(1, delta * this.transitionSpeed));
    this.currentC2.lerp(this.targetC2, Math.min(1, delta * this.transitionSpeed));
    this.currentGlowColor.lerp(this.targetGlowColor, Math.min(1, delta * this.transitionSpeed));

    // Pulse based on state
    let pulse = 1.0;
    if (this.state() === 'talking') {
      pulse = 1.0 + 0.45 * Math.sin(elapsed * 18.0) * (0.6 + 0.4 * Math.cos(elapsed * 4.5));
    } else if (this.state() === 'listening') {
      pulse = 0.95 + 0.15 * Math.sin(elapsed * 4.0);
    } else {
      pulse = 1.0 + 0.12 * Math.sin(elapsed * 2.0);
    }

    // Update shader uniforms
    const uniforms: any = this.particleMaterial.uniforms;
    uniforms.uTime.value = elapsed;
    uniforms.uTransition.value = this.currentTransition;
    uniforms.uAmplitude.value = this.currentAmplitude;
    uniforms.uFrequency.value = this.currentFrequency;
    (uniforms.uColor1.value as THREE.Color).setRGB(this.currentC1.r, this.currentC1.g, this.currentC1.b);
    (uniforms.uColor2.value as THREE.Color).setRGB(this.currentC2.r, this.currentC2.g, this.currentC2.b);
    (uniforms.uGlowColor.value as THREE.Color).setRGB(this.currentGlowColor.r, this.currentGlowColor.g, this.currentGlowColor.b);
    uniforms.uGlow.value = this.currentGlow * pulse;

    // Camera motion
    if (this.state() === 'listening') {
      const angle = elapsed * 0.12;
      this.camera.position.x = 4.5 * Math.sin(angle);
      this.camera.position.z = 4.5 * Math.cos(angle);
      this.camera.position.y = 1.5 + 0.5 * Math.sin(elapsed * 0.3);
    } else {
      this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, 0.0, delta * 2.0);
      this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, 5.5, delta * 2.0);
      this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, 1.8 + 0.1 * Math.sin(elapsed * 1.5), delta * 2.0);
    }
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  private teardown() {
    // stop loop
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

    // disconnect resize observer
    try {
      this.resizeObserver?.disconnect();
    } catch (e) {
      // ignore
    }

    // dispose geometry/material/renderer
    try {
      this.particleGeometry?.dispose();
      this.particleMaterial?.dispose();
      if (this.renderer) {
        // try to lose the context
        try {
          (this.renderer as any).forceContextLoss?.();
        } catch (e) {}
        this.renderer.dispose();
        const canvas = this.renderer.domElement as HTMLCanvasElement | undefined;
        if (canvas) {
          canvas.width = 0;
          canvas.height = 0;
        }
      }
    } catch (e) {
      // ignore
    }

    // clear refs
    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this.particleGeometry = undefined;
    this.particleMaterial = undefined;
    this.particleSystem = undefined;
    this.clock = undefined;
  }
}

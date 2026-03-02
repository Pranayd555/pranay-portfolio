import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    OnDestroy,
    ViewChild,
    Inject,
    PLATFORM_ID,
    afterNextRender,
    DestroyRef,
    inject,
    effect,
} from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';
import * as THREE from 'three';

@Component({
    selector: 'app-background-animation-three',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(window:resize)': 'onResize()',
        '[class.embedded]': 'embedded',
    },
    template: `
    <canvas #canvas class="background-canvas" [style.top.px]="headerHeight"></canvas>
  `,
    styleUrls: ['./background-animation-three.component.css'],
})
export class BackgroundAnimationThreeComponent implements OnDestroy {
    @Input() embedded = false;

    @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

    private destroyRef = inject(DestroyRef);
    private themeService = inject(ThemeService);
    private platformId = inject(PLATFORM_ID);
    private document = inject(DOCUMENT);

    public headerHeight = 0;

    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private particles!: THREE.Points;
    private animationFrameId?: number;
    private timer?: THREE.Timer;

    private numParticles = 140;
    private rings = 14;
    private sphereRadius = 300;
    private autoRotateSpeed = 0.0012;

    private colorConfig = {
        dark: { dot: new THREE.Color(0x00f3ff) }, // Cyan Neon
        light: { dot: new THREE.Color(0x135bec) }, // Primary Blue
    };

    constructor() {
        // 3D implementation verified against `three-js-architect` skill for Angular 21/Zoneless compliance.

        effect(() => {
            const isDark = this.themeService.darkMode();
            const color = isDark ? this.colorConfig.dark.dot : this.colorConfig.light.dot;
            if (this.particles && this.particles.material instanceof THREE.ShaderMaterial) {
                this.particles.material.uniforms['uColor'].value.copy(color);
                this.particles.material.uniforms['uIsDark'].value = isDark ? 1.0 : 0.0;
                this.particles.material.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
            }
        });

        afterNextRender(() => {
            if (isPlatformBrowser(this.platformId)) {
                this.initThree();
                this.animate();
            }
        });

        this.destroyRef.onDestroy(() => {
            this.cleanup();
        });
    }

    private initThree(): void {
        const canvas = this.canvasRef.nativeElement;
        const header = this.document.querySelector('nav');
        this.headerHeight = header?.clientHeight ?? 0;

        this.scene = new THREE.Scene();

        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 2500);
        this.camera.position.z = 650;

        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true,
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        this.timer = new THREE.Timer();
        this.timer.connect(this.document);

        this.createParticles();
        this.updateRadius();
    }

    private createParticles(): void {
        const positions: number[] = [];
        const offsets: number[] = [];

        // Use a small epsilon to avoid exact poles where points overlap
        const phiStart = 0.15;
        const phiEnd = Math.PI - 0.15;
        const phiRange = phiEnd - phiStart;

        const ringStep = phiRange / (this.rings - 1);
        const pointsPerRing = Math.ceil(this.numParticles / this.rings);

        let index = 0;
        for (let i = 0; i < this.rings; i++) {
            const phi = phiStart + i * ringStep;
            const y = this.sphereRadius * Math.cos(phi);
            const r = this.sphereRadius * Math.sin(phi);

            const staggering = (i % 2) * (Math.PI / pointsPerRing);

            for (let j = 0; j < pointsPerRing && index < this.numParticles; j++) {
                const theta = (j / pointsPerRing) * Math.PI * 2 + staggering;
                const x = r * Math.cos(theta);
                const z = r * Math.sin(theta);

                positions.push(x, y, z);
                // Serial offset based on ring and position
                offsets.push((i / this.rings) + (j / pointsPerRing));
                index++;
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('aOffset', new THREE.Float32BufferAttribute(offsets, 1));

        const isDark = this.themeService.darkMode();
        const initialColor = isDark ? this.colorConfig.dark.dot : this.colorConfig.light.dot;

        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uColor: { value: new THREE.Color().copy(initialColor) },
                uIsDark: { value: isDark ? 1.0 : 0.0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
            },
            vertexShader: `
                uniform float uTime;
                uniform float uPixelRatio;
                attribute float aOffset;
                varying float vGlow;
                
                void main() {
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    
                    // Controlled ripple
                    float glow = sin(uTime * 1.2 + aOffset * 6.28) * 0.5 + 0.5;
                    vGlow = glow;
                    
                    // Fixed size multipliers and CLAMP to prevent massive polar/proximal dots
                    float baseSize = 8.5;
                    float pulseSize = baseSize * (1.1 + glow * 0.35); 
                    float perspectiveSize = pulseSize * (600.0 / -mvPosition.z);
                    
                    gl_PointSize = min(perspectiveSize * uPixelRatio, 50.0); 
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                uniform float uIsDark;
                varying float vGlow;
                
                void main() {
                    float d = distance(gl_PointCoord, vec2(0.5));
                    if (d > 0.5) discard;
                    
                    float coreSize = uIsDark > 0.5 ? 0.07 : 0.12;
                    float core = smoothstep(coreSize + 0.1, coreSize, d);
                    float outerGlow = smoothstep(0.5, 0.1, d);
                    
                    vec3 finalColor;
                    float alpha;

                    if (uIsDark > 0.5) {
                        // Dark Mode: Neon glow
                        vec3 highlightColor = mix(uColor, vec3(1.0), 0.55);
                        finalColor = mix(uColor, highlightColor, core);
                        alpha = mix(outerGlow * 0.35, core * 1.0, 0.45);
                    } else {
                        // Light Mode: Filled dots
                        vec3 highlightColor = mix(uColor, vec3(1.0), 0.25); 
                        finalColor = mix(uColor, highlightColor, core);
                        alpha = mix(outerGlow * 0.45, core * 1.0, 0.75);
                    }
                    
                    // Pulse influence
                    alpha *= (0.85 + vGlow * 0.15);
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
            depthWrite: false,
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }

    private animate(): void {
        if (!this.renderer || !this.scene || !this.camera || !this.timer) return;
        this.animationFrameId = requestAnimationFrame(() => this.animate());

        this.timer.update();
        const elapsedTime = this.timer.getElapsed();
        if (this.particles && this.particles.material instanceof THREE.ShaderMaterial) {
            this.particles.material.uniforms['uTime'].value = elapsedTime;
        }

        if (this.particles) {
            this.particles.rotation.y += this.autoRotateSpeed;
            this.particles.rotation.x += this.autoRotateSpeed * 0.4;
        }

        this.renderer.render(this.scene, this.camera);
    }

    onResize(): void {
        if (!this.renderer || !this.camera) return;
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        if (this.particles && this.particles.material instanceof THREE.ShaderMaterial) {
            this.particles.material.uniforms['uPixelRatio'].value = Math.min(window.devicePixelRatio, 2);
        }
        this.updateRadius();
    }

    private updateRadius(): void {
        const minDim = Math.min(window.innerWidth, window.innerHeight);
        const newRadius = Math.max(200, minDim * 0.43);

        if (this.particles) {
            const scale = newRadius / this.sphereRadius;
            this.particles.scale.set(scale, scale, scale);
        }
    }

    private cleanup(): void {
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

        this.timer?.dispose();
        this.timer = undefined;

        if (this.renderer) this.renderer.dispose();
        if (this.particles) {
            this.particles.geometry.dispose();
            (this.particles.material as THREE.Material).dispose();
        }
        this.scene?.clear();
    }

    ngOnDestroy(): void { }
}

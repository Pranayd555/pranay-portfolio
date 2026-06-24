import { CommonModule, isPlatformBrowser } from '@angular/common';
import { afterNextRender, AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, effect, ElementRef, inject, OnDestroy, output, PLATFORM_ID, signal, ViewChild } from '@angular/core';
import { WebGLRenderer, Scene, PerspectiveCamera, Points, Clock, Color, IcosahedronGeometry,  PointsMaterial, AdditiveBlending, Material} from 'three';
@Component({
  selector: 'app-talk',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './talk.html',
  styleUrl: './talk.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Talk implements AfterViewInit, OnDestroy {
  @ViewChild('threeCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  openChat = output<boolean>();

  // Component states
  talkState = signal<'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING'>('LISTENING');
  userTranscript = signal<string>('');
  evaResponseText = signal<string>('');
  isMuted = signal<boolean>(false);
  readonly platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);

  // Three.js Core Engines
  private renderer!: WebGLRenderer;
  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private particleMesh!: Points;
  private animationFrameId!: number;
  private clock = new Clock();

  // Animation interpolation targets
  private targetSpeed = 0.4;
  private currentSpeed = 0.4;
  private targetIntensity = 0.15;
  private currentIntensity = 0.15;
  private targetColor = new Color('#8b5cf6'); // Purple
  private currentColor = new Color('#8b5cf6');

  constructor() {
    // Monitor state signals to alter the 3D matrix properties smoothly
    effect(() => {
      switch (this.talkState()) {
        case 'IDLE':
          this.targetSpeed = 0.4;
          this.targetIntensity = 0.12;
          this.targetColor.set('#8b5cf6'); // Violet
          break;
        case 'LISTENING':
          this.targetSpeed = 1.8;
          this.targetIntensity = 0.45; // Energetic sound spikes
          this.targetColor.set('#f43f5e'); // Rose Crimson
          break;
        case 'THINKING':
          this.targetSpeed = 3.5;
          this.targetIntensity = 0.05; // High-frequency condensed hum
          this.targetColor.set('#f59e0b'); // Amber Gold
          break;
        case 'SPEAKING':
          this.targetSpeed = 0.9;
          this.targetIntensity = 0.35; // Rhythmic swelling waves
          this.targetColor.set('#10b981'); // Emerald Cyber
          break;
      }
    });

    afterNextRender(() => {
            if (isPlatformBrowser(this.platformId)) {
                this.initThreeEngine();
            }
        });

        this.destroyRef.onDestroy(() => {
            this.cleanup();
        });
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    // Prevent memory leaks and preserve background thread frames
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initThreeEngine() {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.parentElement!.clientWidth;
    const height = canvas.parentElement!.clientHeight;

    // 1. Scene & Camera Setup
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.z = 5;

    // 2. WebGL Renderer
    this.renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3. Build Holographic Particle Geometry
    const geometry = new IcosahedronGeometry(1.5, 4); // Subdivided point structure
    
    // Backup original positions for procedural wave calculations
    const positionAttribute = geometry.attributes['position'];
    const originalPositions = new Float32Array(positionAttribute.count * 3);
    for (let i = 0; i < positionAttribute.count * 3; i++) {
      originalPositions[i] = positionAttribute.array[i];
    }
    (geometry as any).userData = { originalPositions };

    // 4. Particle Texture / Styling Material
    const material = new PointsMaterial({
      size: 0.035,
      color: this.currentColor,
      transparent: true,
      opacity: 0.85,
      blending: AdditiveBlending,
      depthWrite: false
    });

    this.particleMesh = new Points(geometry, material);
    this.scene.add(this.particleMesh);

    // 5. Handle Resize Listeners
    window.addEventListener('resize', this.resizeViewport);

    // 6. Start Loop
    this.renderLoop();
  }

  private renderLoop = () => {
    this.animationFrameId = requestAnimationFrame(this.renderLoop);

    const elapsed = this.clock.getElapsedTime();
    const geometry = this.particleMesh.geometry;
    const positionAttribute = geometry.attributes['position'];
    const originals = (geometry as any).userData.originalPositions;

    // Smoothly lerp dynamic state constants to avoid "jelly" anomalies
    this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.1;
    this.currentIntensity += (this.targetIntensity - this.currentIntensity) * 0.1;
    this.currentColor.lerp(this.targetColor, 0.1);
    
    // Update active particle coloring
    (this.particleMesh.material as PointsMaterial).color.copy(this.currentColor);

    // Constant structural rotations
    this.particleMesh.rotation.y = elapsed * 0.15;
    this.particleMesh.rotation.x = elapsed * 0.08;

    // Procedural Vertex Matrix Displacement Loop
    for (let i = 0; i < positionAttribute.count; i++) {
      const idx = i * 3;
      
      const x = originals[idx];
      const y = originals[idx + 1];
      const z = originals[idx + 2];

      // Clean trigonometric wave generation across the sphere's bounds
      const waveOffset = (elapsed * this.currentSpeed) + (x * 1.5) + (y * 1.5);
      const scaleFactor = 1 + Math.sin(waveOffset) * this.currentIntensity;

      // Displace position out from the core origin
      positionAttribute.array[idx] = x * scaleFactor;
      positionAttribute.array[idx + 1] = y * scaleFactor;
      positionAttribute.array[idx + 2] = z * scaleFactor;
    }

    positionAttribute.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
  }

  private resizeViewport = () => {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement;
    if (!container) return;

    const w = container.clientWidth;
    const h = container.clientHeight;

    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  // Operation controls
  startVoiceListening() {
    this.userTranscript.set('Streaming audio matrix...');
    this.talkState.set('LISTENING');
  }

  stopVoiceListening() {
    this.talkState.set('THINKING');
    this.userTranscript.set('Analyze systemic potential, Eva.');
    
    setTimeout(() => {
      this.talkState.set('SPEAKING');
      this.evaResponseText.set('Core systems online. Pranay’s application repository is completely integrated and optimal.');
    }, 1500);
  }

  toggleSystemMute() { this.isMuted.set(!this.isMuted()); }
  switchToChatMode() { /* State controller logic back to text-chat */ }

  private cleanup(): void {
          if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  
          this.camera.clear();
  
          if (this.renderer) this.renderer.dispose();
          if (this.particleMesh) {
              this.particleMesh.geometry.dispose();
              (this.particleMesh.material as Material).dispose();
          }
          this.scene?.clear();
      }
}
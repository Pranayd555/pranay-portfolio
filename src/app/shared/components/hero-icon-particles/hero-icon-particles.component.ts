import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  afterNextRender,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { skillsData } from '../../../features/home/sections/data/skills-data';

interface IconSprite {
  sprite: THREE.Sprite;
  orbitRadiusFactor: number;
  orbitRadius: number;
  orbitSpeed: number;
  orbitPhase: number;
  bobPhase: number;
  bobAmplitudeFactor: number;
  bobAmplitude: number;
  tiltX: number;
  tiltZ: number;
}

@Component({
  selector: 'app-hero-icon-particles',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas class="absolute inset-0 w-full h-full"></canvas>`,
  styles: [`
    :host { display: block; position: absolute; inset: 0; pointer-events: none; z-index: 5; }
  `],
})
export class HeroIconParticlesComponent implements OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private iconSprites: IconSprite[] = [];
  private animationFrameId?: number;
  private clock = new THREE.Clock();
  private resizeObserver?: ResizeObserver;
  private viewport = { w: 0, h: 0, min: 0 };

  private readonly ICON_PATHS = skillsData
    .flatMap(cat => cat.skills)
    .filter(s => s.icon !== '')
    .map(s => ({ name: s.name, icon: s.icon }));

  constructor() {
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.initThree();
        this.loadIconsAndAnimate();
      }
    });

    this.destroyRef.onDestroy(() => this.cleanup());
  }

  private readViewport(): { w: number; h: number; min: number } {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    return { w, h, min: Math.min(w, h) };
  }

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    this.scene = new THREE.Scene();

    this.viewport = this.readViewport();
    const aspect = this.viewport.w / this.viewport.h;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, this.viewport.min * 10);
    this.camera.position.z = this.viewport.min * 1.25;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(this.viewport.w, this.viewport.h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(canvas);
  }

  private loadIconsAndAnimate(): void {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    let loaded = 0;
    const total = this.ICON_PATHS.length;

    this.ICON_PATHS.forEach((iconDef, i) => {
      loader.load(
        iconDef.icon,
        (texture) => {
          const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.75,
            depthWrite: false,
          });
          const sprite = new THREE.Sprite(material);

          const spriteScale = this.viewport.min * 0.055;
          sprite.scale.set(spriteScale, spriteScale, 1);

          const orbitRadiusFactor = 0.22 + Math.random() * 0.24;
          const orbitRadius = this.viewport.min * orbitRadiusFactor;
          const orbitSpeed  = 0.12 + Math.random() * 0.25;
          const orbitPhase  = (i / total) * Math.PI * 2;
          const bobPhase    = Math.random() * Math.PI * 2;
          const bobAmplitudeFactor = 0.03 + Math.random() * 0.03;
          const bobAmp = this.viewport.min * bobAmplitudeFactor;
          const tiltX       = (Math.random() - 0.5) * 0.8;
          const tiltZ       = (Math.random() - 0.5) * 0.4;

          const iconSprite: IconSprite = {
            sprite,
            orbitRadiusFactor,
            orbitRadius,
            orbitSpeed,
            orbitPhase,
            bobPhase,
            bobAmplitudeFactor,
            bobAmplitude: bobAmp,
            tiltX,
            tiltZ,
          };

          this.iconSprites.push(iconSprite);
          this.scene.add(sprite);

          loaded++;
          if (loaded === 1) {
            // Start animation as soon as first icon loads
            this.animate();
          }
        },
        undefined,
        () => {
          // Silently skip failed icon loads
          loaded++;
        }
      );
    });
  }

  private animate(): void {
    if (!this.renderer || !this.scene || !this.camera) return;
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    const t = this.clock.getElapsedTime();

    for (const icon of this.iconSprites) {
      const angle = t * icon.orbitSpeed + icon.orbitPhase;
      icon.sprite.position.x = icon.orbitRadius * Math.cos(angle);
      icon.sprite.position.z = icon.orbitRadius * Math.sin(angle) * Math.cos(icon.tiltX);
      icon.sprite.position.y =
        icon.orbitRadius * Math.sin(angle) * Math.sin(icon.tiltX) +
        Math.sin(t * 0.6 + icon.bobPhase) * icon.bobAmplitude;

      // Fade icons that are behind the sphere center (depth cue)
      const depth = (icon.sprite.position.z + icon.orbitRadius) / (icon.orbitRadius * 2);
      if (icon.sprite.material instanceof THREE.SpriteMaterial) {
        icon.sprite.material.opacity = 0.35 + depth * 0.55;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  onResize(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.renderer || !this.camera) return;

    this.viewport = this.readViewport();
    this.camera.aspect = this.viewport.w / this.viewport.h;
    this.camera.far = this.viewport.min * 10;
    this.camera.position.z = this.viewport.min * 1.25;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.viewport.w, this.viewport.h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scale = this.viewport.min * 0.055;
    for (const icon of this.iconSprites) {
      icon.sprite.scale.set(scale, scale, 1);
      icon.orbitRadius = this.viewport.min * icon.orbitRadiusFactor;
      icon.bobAmplitude = this.viewport.min * icon.bobAmplitudeFactor;
    }
  }

  private cleanup(): void {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    for (const icon of this.iconSprites) {
      if (icon.sprite.material instanceof THREE.SpriteMaterial) {
        icon.sprite.material.map?.dispose();
        icon.sprite.material.dispose();
      }
    }
    if (this.renderer) this.renderer.dispose();
    this.scene?.clear();
    this.iconSprites = [];
  }

  ngOnDestroy(): void {}
}

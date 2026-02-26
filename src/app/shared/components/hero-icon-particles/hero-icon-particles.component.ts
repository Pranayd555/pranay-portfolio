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
  orbitRadius: number;
  orbitSpeed: number;
  orbitPhase: number;
  bobPhase: number;
  bobAmplitude: number;
  tiltX: number;
  tiltZ: number;
}

@Component({
  selector: 'app-hero-icon-particles',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:resize)': 'onResize()' },
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

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    this.scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 3000);
    this.camera.position.z = 700;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  private loadIconsAndAnimate(): void {
    const loader = new THREE.TextureLoader();
    const scale = Math.min(window.innerWidth, window.innerHeight);

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

          const spriteScale = scale * 0.05;
          sprite.scale.set(spriteScale, spriteScale, 1);

          const orbitRadius = 180 + Math.random() * 220;
          const orbitSpeed  = 0.12 + Math.random() * 0.25;
          const orbitPhase  = (i / total) * Math.PI * 2;
          const bobPhase    = Math.random() * Math.PI * 2;
          const bobAmp      = 18 + Math.random() * 28;
          const tiltX       = (Math.random() - 0.5) * 0.8;
          const tiltZ       = (Math.random() - 0.5) * 0.4;

          const iconSprite: IconSprite = {
            sprite,
            orbitRadius,
            orbitSpeed,
            orbitPhase,
            bobPhase,
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
    if (!this.renderer || !this.camera) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scale = Math.min(w, h) * 0.05;
    for (const icon of this.iconSprites) {
      icon.sprite.scale.set(scale, scale, 1);
    }
  }

  private cleanup(): void {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
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

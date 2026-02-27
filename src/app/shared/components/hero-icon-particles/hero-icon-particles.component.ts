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
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { skillsData } from '../../../features/home/sections/data/skills-data';

@Component({
  selector: 'app-hero-icon-particles',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'absolute inset-0 pointer-events-none z-5', '(window:resize)': 'onResize()'  },
  template: `<canvas #canvas class="absolute inset-0 h-full w-full touch-none select-none"></canvas>`,
})
export class HeroIconParticlesComponent implements OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private ringGroup!: THREE.Group;
  private sprites: THREE.Sprite[] = [];
  private animationFrameId?: number;
  private timer?: THREE.Timer;

  private isDestroyed = false;
  private isDragging = false;
  private draggingPointerId?: number;
  private previousPointerX = 0;
  private rotationVelocity = 0;
  private onWindowResize?: () => void;
  private removePointerListeners?: () => void;

  private readonly ICON_PATHS: readonly string[] = skillsData
    .flatMap(cat => cat.skills)
    .filter(s => s.icon !== '')
    .map(s => s.icon);

  private readonly RING_RADIUS = 6;
  private readonly ICON_SIZE = 0.7;
  private readonly AUTO_ROTATE_SPEED = 0.22; // radians / second

  constructor() {
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.initThree();
        this.attachPointerControls();
        this.createIconRing();
        this.animate();
      }
    });

    this.destroyRef.onDestroy(() => this.cleanup());
  }

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    this.camera.position.z = 16;
    this.camera.position.y = 0;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.onResize();

    this.timer = new THREE.Timer();
    this.timer.connect(this.document);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    this.scene.add(light);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);

    this.ringGroup = new THREE.Group();
    this.scene.add(this.ringGroup);

    this.onWindowResize = () => this.onResize();
    window.addEventListener('resize', this.onWindowResize, { passive: true });
  }

  private isInteractiveTarget(el: EventTarget | null): boolean {
    if (!(el instanceof Element)) return false;
    return Boolean(el.closest('a,button,[role="button"],input,textarea,select,label'));
  }

  private attachPointerControls(): void {
    if (this.removePointerListeners) return;
    const doc = this.document;

    const onPointerDown = (ev: PointerEvent): void => {
      if (!ev.isPrimary) return;
      if (this.isInteractiveTarget(ev.target)) return;

      this.isDragging = true;
      this.draggingPointerId = ev.pointerId;
      this.previousPointerX = ev.clientX;
      doc.body?.classList.add('select-none');
      ev.preventDefault();
    };

    const onPointerMove = (ev: PointerEvent): void => {
      if (!this.isDragging) return;
      if (this.draggingPointerId !== ev.pointerId) return;

      const dx = ev.clientX - this.previousPointerX;
      this.rotationVelocity = dx * 0.005;
      if (this.ringGroup) this.ringGroup.rotation.y += this.rotationVelocity;
      this.previousPointerX = ev.clientX;
      ev.preventDefault();
    };

    const endDrag = (ev: PointerEvent): void => {
      if (!this.isDragging) return;
      if (this.draggingPointerId !== ev.pointerId) return;
      this.isDragging = false;
      this.draggingPointerId = undefined;
      doc.body?.classList.remove('select-none');
    };

    doc.addEventListener('pointerdown', onPointerDown, { passive: false });
    doc.addEventListener('pointermove', onPointerMove, { passive: false });
    doc.addEventListener('pointerup', endDrag, { passive: true });
    doc.addEventListener('pointercancel', endDrag, { passive: true });

    this.removePointerListeners = () => {
      doc.removeEventListener('pointerdown', onPointerDown);
      doc.removeEventListener('pointermove', onPointerMove);
      doc.removeEventListener('pointerup', endDrag);
      doc.removeEventListener('pointercancel', endDrag);
      doc.body?.classList.remove('select-none');
    };
  }

  private createIconRing(): void {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');

    const total = Math.max(1, this.ICON_PATHS.length);
    const angleStep = (Math.PI * 2) / total;

    this.ICON_PATHS.forEach((iconPath, i) => {
      loader.load(
        iconPath,
        (texture) => {
          if (this.isDestroyed) {
            texture.dispose();
            return;
          }
          const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9,
            depthWrite: false,
          });
          const sprite = new THREE.Sprite(material);
          sprite.scale.set(this.ICON_SIZE, this.ICON_SIZE, 1);

          const angle = i * angleStep;
          sprite.position.x = this.RING_RADIUS * Math.cos(angle);
          sprite.position.z = this.RING_RADIUS * Math.sin(angle);
          sprite.position.y = 6;

          this.sprites.push(sprite);
          this.ringGroup.add(sprite);
        },
        undefined, 
        () => {
          // Silently skip failed icon loads
        }
      );
    });
  }

  private animate(): void {
    if (!this.renderer || !this.scene || !this.camera || !this.timer) return;
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    this.timer.update();
    const dt = this.timer.getDelta();

    if (this.ringGroup && !this.isDragging) {
      this.ringGroup.rotation.y += this.AUTO_ROTATE_SPEED * dt;

      if (Math.abs(this.rotationVelocity) > 0.0001) {
        this.ringGroup.rotation.y += this.rotationVelocity;
        const damping = Math.pow(0.95, dt * 60);
        this.rotationVelocity *= damping;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  onResize(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.renderer || !this.camera) return;

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  private cleanup(): void {
    this.isDestroyed = true;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

    this.timer?.dispose();
    this.timer = undefined;

    if (this.onWindowResize) window.removeEventListener('resize', this.onWindowResize);
    this.onWindowResize = undefined;
    this.removePointerListeners?.();
    this.removePointerListeners = undefined;

    for (const sprite of this.sprites) {
      if (sprite.material instanceof THREE.SpriteMaterial) {
        sprite.material.map?.dispose();
        sprite.material.dispose();
      }
    }
    if (this.renderer) this.renderer.dispose();
    this.scene?.clear();
    this.sprites = [];
  }

  ngOnDestroy(): void {}
}

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
import { CSG } from 'three-csg-ts';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { skillsData } from '../../../features/home/sections/data/skills-data';

const CYCLE_DURATION = 14;
const LID_OPEN_ANGLE = -Math.PI * 0.65;
const MAX_ICONS = 24;
const RATTLE_AMP = 0.018;
const RATTLE_FREQ = 45;

const PHASE = {
  RATTLE_END: 0.06,
  OPEN_END: 0.18,
  FLY_OUT_END: 0.36,
  HOVER_END: 0.58,
  RETURN_END: 0.68,
  CLOSE_END: 0.82,
} as const;

const ICON_SCALE_START = 0.45;
const ICON_SCALE_END = 1.15;
const AMBIENT_PARTICLE_COUNT = 280;

/** Smooth ease-out cubic for fluid transition */
function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
}

interface IconSprite {
  mesh: THREE.Mesh;
  startPos: THREE.Vector3;
  hoverPos: THREE.Vector3;
  hoverPhase: number;
  streamPhase: number;
}

@Component({
  selector: 'app-hero-icon-particles',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'absolute inset-0 pointer-events-none z-5',
    '(window:resize)': 'onResize()',
  },
  template: `<canvas #canvas class="absolute inset-0 h-full w-full touch-none select-none pointer-events-auto"></canvas>`,
})
export class HeroIconParticlesComponent implements OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private destroyRef = inject(DestroyRef);
  private platformId = inject(PLATFORM_ID);

  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private container?: THREE.Mesh;
  private coverGroup?: THREE.Group;
  private coverCap?: THREE.Mesh;
  private coverLip?: THREE.Mesh;
  private parcelMaterial?: THREE.MeshStandardMaterial;
  private ambientLight?: THREE.AmbientLight;
  private directionalLight?: THREE.DirectionalLight;
  private rimLight?: THREE.DirectionalLight;
  private fillLightA?: THREE.DirectionalLight;
  private fillLightB?: THREE.DirectionalLight;
  private controls?: InstanceType<typeof OrbitControls>;
  private clock = new THREE.Clock();
  private animationFrameId?: number;
  private iconSprites: IconSprite[] = [];
  private textureLoader?: THREE.TextureLoader;
  private iconGroup?: THREE.Group;
  private ambientParticles?: THREE.Points;
  private ambientParticleInitial?: Float32Array;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      if (!this.canvasRef?.nativeElement) return;

      this.initThree();
      this.animate();
    });

    this.destroyRef.onDestroy(() => this.cleanup());
  }

  onResize(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.camera || !this.renderer) return;

    const { width, height, aspect } = this.getCanvasMetrics();
    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    const { width, height, aspect } = this.getCanvasMetrics();

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(80, aspect, 0.1, 100);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableZoom = false;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = -3;
    this.camera.position.set(-3.5, -1.5, 2);
    this.controls.update();

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
    this.directionalLight.position.set(2, 2, 3);
    this.scene.add(this.ambientLight, this.directionalLight);

    const rim = new THREE.DirectionalLight(0x00f3ff, 0.7);
    rim.position.set(-5, 3, -5);
    this.scene.add(rim);
    this.rimLight = rim;

    this.fillLightA = new THREE.DirectionalLight(0xffffff, 0.75);
    this.fillLightA.position.set(4, 2, 4);
    this.scene.add(this.fillLightA);
    this.fillLightB = new THREE.DirectionalLight(0xffffff, 0.7);
    this.fillLightB.position.set(-4, 1, -4);
    this.scene.add(this.fillLightB);

    this.parcelMaterial = new THREE.MeshStandardMaterial({
      color: 0x14253d,
      metalness: 0.25,
      roughness: 0.35,
      emissive: 0x14253d,
      emissiveIntensity: 0.12,
    });

    const outer = new THREE.Mesh(
      new THREE.BoxGeometry(1.02, 1, 1.02),
      this.parcelMaterial
    );
    const inner = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 0.96, 1.0),
      this.parcelMaterial
    );
    inner.position.y = 0.02;
    inner.updateMatrixWorld(true);
    this.container = CSG.subtract(outer, inner);
    outer.geometry.dispose();
    inner.geometry.dispose();

    this.container.position.set(0, 0, 0);
    this.scene.add(this.container);

    const capGeom = new THREE.BoxGeometry(1.12, 0.04, 1.12);
    this.coverCap = new THREE.Mesh(capGeom, this.parcelMaterial);
    this.coverCap.position.set(0, 0.05, 0.6);

    const lipGeom = new THREE.BoxGeometry(0.98, 0.05, 0.98);
    this.coverLip = new THREE.Mesh(lipGeom, this.parcelMaterial);
    this.coverLip.position.set(0, 0.005, 0.6);

    this.coverGroup = new THREE.Group();
    this.coverGroup.position.set(0, 0.5, -0.6);
    this.coverGroup.add(this.coverCap, this.coverLip);
    this.scene.add(this.coverGroup);

    this.iconGroup = new THREE.Group();
    this.scene.add(this.iconGroup);
    this.textureLoader = new THREE.TextureLoader();
    this.loadIconsAndCreateSprites();
    this.createAmbientParticles();
  }

  private createAmbientParticles(): void {
    if (!this.scene) return;
    const count = AMBIENT_PARTICLE_COUNT;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    this.ambientParticleInitial = new Float32Array(positions);
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x00f3ff,
      size: 0.035,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      sizeAttenuation: true,
    });
    this.ambientParticles = new THREE.Points(geom, mat);
    this.scene.add(this.ambientParticles);
  }

  private getIconUrls(): string[] {
    return skillsData
      .flatMap((c) => c.skills)
      .filter((s) => (s.icon ?? '').trim() !== '')
      .map((s) => (s.icon.startsWith('/') ? s.icon : '/' + s.icon))
      .slice(0, MAX_ICONS);
  }

  private loadIconsAndCreateSprites(): void {
    if (!this.scene || !this.iconGroup || !this.textureLoader) return;
    const urls = this.getIconUrls();
    if (urls.length === 0) return;

    const doc = typeof document !== 'undefined' ? document : null;
    const base = doc?.querySelector('base')?.href ?? '';
    const load = (path: string) =>
      new Promise<THREE.Texture>((resolve, reject) => {
        const url = base ? new URL(path, base).href : path;
        this.textureLoader!.load(url, resolve, undefined, reject);
      });

    Promise.all(urls.map((url) => load(url)))
      .then((textures) => {
        textures.forEach((tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.needsUpdate = true;
        });
        this.createIconSprites(textures);
      })
      .catch(() => {});
  }

  private createIconSprites(textures: THREE.Texture[]): void {
    if (!this.iconGroup) return;
    const size = 0.26;
    const boxCenterY = 0;
    const boxTop = 0.5;
    const boxHalf = 0.4;
    const openingY = 0.5;
    const hoverRadiusMin = 1.4;
    const hoverRadiusMax = 2.8;
    const phiMax = Math.PI / 2.2;

    textures.forEach((texture, i) => {
      const geom = new THREE.PlaneGeometry(size, size);
      const mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geom, mat);
      const startX = (Math.random() - 0.5) * 2 * boxHalf;
      const startZ = (Math.random() - 0.5) * 2 * boxHalf;
      const startY = boxCenterY + 0.1 + Math.random() * (boxTop - boxCenterY - 0.15);
      const startPos = new THREE.Vector3(startX, startY, startZ);

      const phi = Math.random() * phiMax;
      const theta = Math.random() * Math.PI * 2;
      const radius = hoverRadiusMin + Math.random() * (hoverRadiusMax - hoverRadiusMin);
      const hoverX = radius * Math.sin(phi) * Math.cos(theta);
      const hoverY = openingY + radius * Math.cos(phi);
      const hoverZ = radius * Math.sin(phi) * Math.sin(theta);
      const hoverPos = new THREE.Vector3(hoverX, hoverY, hoverZ);

      mesh.position.copy(startPos);
      mesh.scale.setScalar(ICON_SCALE_START);
      this.iconGroup!.add(mesh);
      this.iconSprites.push({
        mesh,
        startPos,
        hoverPos,
        hoverPhase: Math.random() * Math.PI * 2,
        streamPhase: i / Math.max(1, textures.length),
      });
    });
  }

  private getLidRotation(phase: number): number {
    if (phase < PHASE.RATTLE_END) return 0;
    if (phase < PHASE.OPEN_END) return ((phase - PHASE.RATTLE_END) / (PHASE.OPEN_END - PHASE.RATTLE_END)) * LID_OPEN_ANGLE;
    if (phase < PHASE.CLOSE_END) return LID_OPEN_ANGLE;
    if (phase < PHASE.CLOSE_END + 0.12) return LID_OPEN_ANGLE * (1 - (phase - PHASE.CLOSE_END) / 0.12);
    return 0;
  }

  private getRattleOffset(phase: number, time: number): { x: number; z: number } {
    if (phase >= PHASE.RATTLE_END) return { x: 0, z: 0 };
    const t = time * RATTLE_FREQ;
    return {
      x: Math.sin(t) * RATTLE_AMP + Math.sin(t * 1.7) * (RATTLE_AMP * 0.6),
      z: Math.cos(t * 1.3) * RATTLE_AMP + Math.cos(t * 0.9) * (RATTLE_AMP * 0.6),
    };
  }

  private getIconT(phase: number): number {
    if (phase < PHASE.FLY_OUT_END) {
      const local = (phase - PHASE.OPEN_END) / (PHASE.FLY_OUT_END - PHASE.OPEN_END);
      return Math.min(1, Math.max(0, local));
    }
    if (phase < PHASE.RETURN_END) return 1;
    if (phase < PHASE.CLOSE_END) {
      const local = (phase - PHASE.RETURN_END) / (PHASE.CLOSE_END - PHASE.RETURN_END);
      return 1 - Math.min(1, Math.max(0, local));
    }
    return 0;
  }

  private getIconTForSprite(phase: number, streamPhase: number, isOut: boolean): number {
    const rawT = this.getIconT(phase);
    if (isOut) {
      const spread = 0.2;
      const delayedRaw = (rawT * (1 + spread) - spread * streamPhase);
      const clamped = Math.min(1, Math.max(0, delayedRaw));
      return easeOutCubic(clamped);
    }
    return rawT;
  }

  private animate(): void {
    if (!this.renderer || !this.scene || !this.camera || !this.coverGroup) return;

    this.animationFrameId = requestAnimationFrame(() => this.animate());
    this.controls?.update();

    const elapsed = this.clock.getElapsedTime();
    const t = (elapsed % CYCLE_DURATION) / CYCLE_DURATION;

    const rattle = this.getRattleOffset(t, elapsed);
    if (this.container) {
      this.container.rotation.x = rattle.x;
      this.container.rotation.z = rattle.z;
    }
    this.coverGroup.rotation.x = this.getLidRotation(t);
    this.coverGroup.rotation.z = rattle.z * 0.8;
    this.coverGroup.rotation.y = rattle.x * 0.5;

    const globalIconT = this.getIconT(t);
    const isOutPhase = t >= PHASE.OPEN_END && t < PHASE.FLY_OUT_END;
    const hoverWobble = 0.05 * Math.sin(elapsed * 1.5);
    this.iconSprites.forEach((s) => {
      const iconT = isOutPhase ? this.getIconTForSprite(t, s.streamPhase, true) : globalIconT;
      const target = s.startPos.clone().lerp(s.hoverPos, iconT);
      target.x += hoverWobble * Math.sin(elapsed + s.hoverPhase);
      target.y += hoverWobble * 0.5 * Math.cos(elapsed + s.hoverPhase);
      s.mesh.position.copy(target);
      const scale = ICON_SCALE_START + (ICON_SCALE_END - ICON_SCALE_START) * iconT;
      s.mesh.scale.setScalar(scale);
      s.mesh.lookAt(this.camera!.position);
    });

    if (this.ambientParticles && this.ambientParticleInitial) {
      const attr = this.ambientParticles.geometry.attributes['position'];
      const pos = attr?.array as Float32Array | undefined;
      const init = this.ambientParticleInitial;
      if (pos && init && attr) {
        for (let i = 0; i < AMBIENT_PARTICLE_COUNT; i++) {
          const j = i * 3;
          const drift = 0.35;
          pos[j] = init[j] + drift * Math.sin(elapsed * 0.5 + i * 0.1);
          pos[j + 1] = init[j + 1] + drift * Math.cos(elapsed * 0.4 + i * 0.07);
          pos[j + 2] = init[j + 2] + drift * 0.5 * Math.sin(elapsed * 0.3 + i * 0.05);
        }
        attr.needsUpdate = true;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }

  private getCanvasMetrics(): { width: number; height: number; aspect: number } {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width || canvas.clientWidth || 1));
    const height = Math.max(1, Math.floor(rect.height || canvas.clientHeight || 1));
    return { width, height, aspect: width / height };
  }

  private cleanup(): void {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.controls?.dispose();
    this.controls = undefined;

    if (this.container) {
      this.container.geometry.dispose();
      this.container = undefined;
    }
    if (this.coverCap) {
      this.coverCap.geometry.dispose();
      this.coverCap = undefined;
    }
    if (this.coverLip) {
      this.coverLip.geometry.dispose();
      this.coverLip = undefined;
    }
    this.coverGroup = undefined;

    this.iconSprites.forEach((s) => {
      s.mesh.geometry.dispose();
      const mat = s.mesh.material as THREE.Material;
      if (mat instanceof THREE.MeshBasicMaterial && mat.map) mat.map.dispose();
      mat.dispose();
    });
    this.iconSprites = [];
    if (this.iconGroup) {
      this.scene?.remove(this.iconGroup);
      this.iconGroup.clear();
      this.iconGroup = undefined;
    }
    this.textureLoader = undefined;

    if (this.ambientParticles) {
      this.ambientParticles.geometry.dispose();
      (this.ambientParticles.material as THREE.Material).dispose();
      this.scene?.remove(this.ambientParticles);
      this.ambientParticles = undefined;
    }
    this.ambientParticleInitial = undefined;

    this.parcelMaterial?.dispose();
    this.parcelMaterial = undefined;

    if (this.renderer && typeof this.renderer.dispose === 'function') {
      this.renderer.dispose();
    }
    this.scene?.clear();

    this.scene = undefined;
    this.camera = undefined;
    this.renderer = undefined;
    this.ambientLight = undefined;
    this.directionalLight = undefined;
    this.rimLight = undefined;
    this.fillLightA = undefined;
    this.fillLightB = undefined;
  }

  ngOnDestroy(): void {}
}

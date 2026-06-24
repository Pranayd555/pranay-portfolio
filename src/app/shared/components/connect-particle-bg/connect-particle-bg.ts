import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  PLATFORM_ID,
  ViewChild,
  afterNextRender,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { AfterimagePass } from 'three/examples/jsm/postprocessing/AfterimagePass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { HDRLoader } from 'three/examples/jsm/loaders/HDRLoader.js';

const ASSETS = {
  hdr: '/assets/animations/GRADIENT_01_01_comp.hdr',
  handsModel: '/assets/animations/two_hands_01.fbx',
  surfaceImperfection: '/assets/animations/surf_imp_02.jpg',
  displacement: '/assets/animations/ml-dpt-21-1K_normal.jpeg',
} as const;

const DISPLACEMENT_SHADER = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    displacement: { value: null as THREE.Texture | null },
    scale: { value: 0.025 },
    tileFactor: { value: 2 },
    bottomHeight: { value: 0.25 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform sampler2D displacement;
    uniform float scale;
    uniform float tileFactor;
    uniform float bottomHeight;
    varying vec2 vUv;
    void main() {
      if (vUv.y < bottomHeight) {
        vec2 tiledUv = mod(vUv * tileFactor, 1.0);
        vec2 disp = texture2D(displacement, tiledUv).rg * scale;
        vec2 distUv = vUv + disp;
        gl_FragColor = texture2D(tDiffuse, distUv);
      } else {
        gl_FragColor = texture2D(tDiffuse, vUv);
      }
    }
  `,
};

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

@Component({
  selector: 'app-connect-particle-bg',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:resize)': 'onResize()',
    class: 'absolute inset-0 z-0 block',
  },
  template: `<canvas #canvas class="w-full h-full block"></canvas>`,
  styleUrl: './connect-particle-bg.css',
})
export class ConnectParticleBg {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly destroyRef = inject(DestroyRef);
  readonly platformId = inject(PLATFORM_ID);
  readonly document = inject(DOCUMENT);

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private composer?: EffectComposer;
  private controls?: InstanceType<typeof OrbitControls>;
  private handsGroup?: THREE.Group;
  private handsMat?: THREE.MeshPhysicalMaterial;
  private surfaceImperfection?: THREE.Texture;
  private displacementTexture?: THREE.Texture;
  private envMap?: THREE.Texture;
  private animationFrameId?: number;

  private theta = 0;
  private isUserInteracting = false;
  private transitionProgress = 0;
  private readonly transitionTime = 2;
  private readonly transitionIncrement = 1 / (60 * this.transitionTime);
  private readonly transitionStartCameraPosition = new THREE.Vector3();
  private readonly transitionStartCameraQuaternion = new THREE.Quaternion();

  constructor() {
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId)) {
        this.initThree();
        this.animate();
      }
    });
    this.destroyRef.onDestroy(() => this.cleanup());
  }

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    this.scene = new THREE.Scene();
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(20, 10, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setClearColor(0x050a14);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    const angleLimit = Math.PI / 7;
    this.controls.minPolarAngle = Math.PI / 2 - angleLimit;
    this.controls.maxPolarAngle = Math.PI / 2 + angleLimit;

    this.scene.fog = new THREE.FogExp2(0x050a14, 0.4);

    const hdrLoader = new HDRLoader();
    hdrLoader.load(
      ASSETS.hdr,
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        this.envMap = texture;
        this.scene.environment = texture;
        if (this.handsMat) {
          this.handsMat.envMap = texture;
          this.handsMat.needsUpdate = true;
        }
      },
      undefined,
      () => {}
    );

    this.surfaceImperfection = new THREE.TextureLoader().load(
      ASSETS.surfaceImperfection
    );
    this.surfaceImperfection.wrapS = THREE.RepeatWrapping;
    this.surfaceImperfection.wrapT = THREE.RepeatWrapping;

    this.handsMat = new THREE.MeshPhysicalMaterial({
      color: 0x606060,
      roughness: 0.2,
      metalness: 1,
      roughnessMap: this.surfaceImperfection,
      envMapIntensity: 1.5,
    });
    if (this.envMap) {
      this.handsMat.envMap = this.envMap;
    }

    const fbxLoader = new FBXLoader();
    fbxLoader.load(ASSETS.handsModel, (object) => {
      object.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).material = this.handsMat!;
        }
      });
      object.position.set(0, 0, 0);
      object.scale.setScalar(0.05);
      this.scene.add(object);
      this.handsGroup = object;
    });

    const renderScene = new RenderPass(this.scene, this.camera);
    const afterimagePass = new AfterimagePass();
    afterimagePass.uniforms['damp'].value = 0.9;

    const resolution = new THREE.Vector2(
      window.innerWidth,
      window.innerHeight
    );
    const bloomPass = new UnrealBloomPass(resolution, 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.21;
    bloomPass.strength = 1.25;
    bloomPass.radius = 1;

    this.displacementTexture = new THREE.TextureLoader().load(
      ASSETS.displacement,
      (tex) => {
        tex.minFilter = THREE.NearestFilter;
      }
    );

    const displacementPass = new ShaderPass(DISPLACEMENT_SHADER);
    displacementPass.uniforms['displacement'].value = this.displacementTexture;
    displacementPass.uniforms['scale'].value = 0.015;
    displacementPass.uniforms['tileFactor'].value = 2;
    displacementPass.uniforms['bottomHeight'].value = 0.5;

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderScene);
    this.composer.addPass(afterimagePass);
    this.composer.addPass(bloomPass);
    this.composer.addPass(displacementPass);

    this.controls.addEventListener('start', () => {
      this.isUserInteracting = true;
    });
    this.controls.addEventListener('end', () => {
      this.isUserInteracting = false;
      this.transitionStartCameraPosition.copy(this.camera.position);
      this.transitionStartCameraQuaternion.copy(this.camera.quaternion);
      this.transitionProgress = 0;
    });
  }

  private updateCamera(): void {
    this.theta += 0.005;
    const targetPosition = new THREE.Vector3(
      Math.sin(this.theta) * 2,
      Math.cos(this.theta),
      Math.cos(this.theta) * 3
    );
    const targetQuaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(0, -this.theta, 0)
    );

    if (this.isUserInteracting) {
      if (this.transitionProgress > 0) {
        this.transitionProgress = 0;
      }
      this.transitionStartCameraPosition.copy(this.camera.position);
      this.transitionStartCameraQuaternion.copy(this.camera.quaternion);
    } else if (this.transitionProgress < 1) {
        this.transitionProgress += this.transitionIncrement;
        const eased = easeInOutCubic(this.transitionProgress);
        this.camera.position.lerpVectors(
          this.transitionStartCameraPosition,
          targetPosition,
          eased
        );
        this.camera.quaternion
          .copy(this.transitionStartCameraQuaternion)
          .slerp(targetQuaternion, eased);
      } else {
        this.camera.position.copy(targetPosition);
        this.camera.quaternion.copy(targetQuaternion);
      }
    
    this.camera.lookAt(this.scene.position);
  }

  readonly animate = (): void => {
    if (!this.renderer?.domElement?.isConnected) return;
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.controls?.update();
    this.updateCamera();
    this.composer?.render();
  };

  onResize(): void {
    if (!this.renderer || !this.camera || !this.composer) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const ratio = Math.min(window.devicePixelRatio, 2);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(ratio);
    this.composer.setSize(w, h);
    this.composer.setPixelRatio(ratio);
  }

  private cleanup(): void {
    if (this.animationFrameId != null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
    this.controls?.dispose();
    this.controls = undefined;

    if (this.handsGroup) {
      this.handsGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.geometry?.dispose();
          if (mesh.material) {
            (Array.isArray(mesh.material)
              ? mesh.material
              : [mesh.material]
            ).forEach((m) => (m).dispose());
          }
        }
      });
      this.scene.remove(this.handsGroup);
      this.handsGroup = undefined;
    }
    this.handsMat?.dispose();
    this.handsMat = undefined;
    this.surfaceImperfection?.dispose();
    this.surfaceImperfection = undefined;
    this.displacementTexture?.dispose();
    this.displacementTexture = undefined;
    this.envMap?.dispose();
    this.envMap = undefined;
    this.composer?.dispose();
    this.composer = undefined;
    this.renderer?.dispose();
    this.renderer = undefined;
    this.scene?.clear();
  }

}

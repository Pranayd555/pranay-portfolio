import { ChangeDetectionStrategy, Component, ElementRef, OnInit, OnDestroy, ViewChild, Inject, PLATFORM_ID, AfterViewInit, effect, Injector, runInInjectionContext, DOCUMENT, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
    selector: 'app-background-animation',
    standalone: true,
    imports: [CommonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '(window:resize)': 'onResize()'
    },
    template: `
    <canvas #canvas class="background-canvas" [style.top.px]="headerHeight"></canvas>
  `,
    styleUrls: ['./background-animation.component.css']
})
export class BackgroundAnimationComponent implements AfterViewInit, OnDestroy {
    @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
    private ctx!: CanvasRenderingContext2D;
    private animationFrameId!: number;
    private particles: Particle[] = [];
    private numParticles = 100; // Adjust for density
    private lastTime = 0;
    private sphereRadius = 250; // Radius of the sphere
    private autoRotateSpeed = 0.002;
    private rings = 14;                 // vertical divisions
    private pointsPerRing = Math.floor(this.numParticles / this.rings);
    public headerHeight = 0;

    // Theme colors
    private isDark = true;
    private colorConfig = {
        dark: { dot: 'rgba(0, 255, 255, 0.9)', line: 'rgba(0, 255, 255, 0.2)' }, // Brighter Cyan for Dark Mode
        light: { dot: 'rgba(19, 91, 236, 0.9)', line: 'rgba(19, 91, 236, 0.25)' }  // Colorful Primary Blue for Light Mode
    };

    constructor(
        private cdr: ChangeDetectorRef,
        @Inject(PLATFORM_ID) private platformId: Object,
        @Inject(DOCUMENT) private document: Document,
        private themeService: ThemeService
    ) {
        // Track theme changes using signal effect
        effect(() => {
            this.isDark = this.themeService.darkMode();
        });
    }

    ngAfterViewInit(): void {
        const header = this.document.querySelector('nav');
        this.headerHeight = header?.clientHeight ?? 0;
        if (isPlatformBrowser(this.platformId)) {
            this.initCanvas();
            this.createParticles();
            this.animate();
        }
        this.cdr.detectChanges();
    }

    ngOnDestroy(): void {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    private initCanvas(): void {
        const canvas = this.canvasRef.nativeElement;
        this.ctx = canvas.getContext('2d')!;
        this.resizeCanvas();
    }

    private resizeCanvas(): void {
        const canvas = this.canvasRef.nativeElement;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Adjust sphere radius based on screen size (responsive)
        const minDim = Math.min(canvas.width, canvas.height);
        this.sphereRadius = Math.max(150, minDim * 0.35); // Approx 35% of smaller dimension

        // Re-create particles to fit new radius if needed, or just let them stay?
        // Better to re-project. Actually, the animate loop uses individual particle locations x,y,z. 
        // We need to scale them or just re-create them. Re-creating is easiest for uniformity.
        this.createParticles();
    }

    onResize(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.resizeCanvas();
        }
    }

    private createParticles(): void {
        this.particles = [];
        const ringStep = Math.PI / this.rings;

        let index = 0;

        for (let i = 0; i < this.rings; i++) {
            const phi = i * ringStep;
            const y = this.sphereRadius * Math.cos(phi);
            const r = this.sphereRadius * Math.sin(phi);

            const offset = (i % 2) * (Math.PI / this.pointsPerRing); // ⬅ hex staggering

            for (let j = 0; j < this.pointsPerRing && index < this.numParticles; j++) {
                const theta = (j / this.pointsPerRing) * Math.PI * 2 + offset;

                const x = r * Math.cos(theta);
                const z = r * Math.sin(theta);

                this.particles.push(new Particle(x, y, z));
                index++;
            }
        }
    }

    private animate(time: number = 0): void {
        if (!this.ctx) return;

        // Calculate delta time for consistent speed (target 60fps)
        const deltaTime = this.lastTime ? (time - this.lastTime) / 16.67 : 1;
        this.lastTime = time;

        this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

        // Update rotations with deltaTime normalization
        const rotationSpeed = this.autoRotateSpeed * deltaTime;
        this.particles.forEach(p => {
            p.rotateY(rotationSpeed);
            p.rotateX(rotationSpeed * 0.5);
        });

        // Projection phase
        const effectiveHeight = this.canvasRef.nativeElement.height - this.headerHeight;
        this.particles.forEach(p => p.project(this.canvasRef.nativeElement.width, effectiveHeight, 400));

        const currentColors = this.isDark ? this.colorConfig.dark : this.colorConfig.light;

        // 1. Draw central background glow gradient (no shadow for performance)
        this.ctx.save();

        this.ctx.shadowBlur = 12; // glow strength
        this.ctx.shadowColor = currentColors.dot;
        // Draw central glow
        const centerX = this.canvasRef.nativeElement.width / 2;
        const centerY = this.canvasRef.nativeElement.height / 2;
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, 300);
        this.ctx.save();

        // Add glow
        this.ctx.shadowBlur = this.isDark ? 14 : 10;
        this.ctx.shadowColor = currentColors.dot;

        this.ctx.fillStyle = currentColors.dot;

        this.particles.forEach(p => {
            const size = Math.max(0.6, (400 / (400 - p.z)) * 1.6);

            this.ctx.beginPath();
            this.ctx.arc(p.px, p.py, size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ctx.restore();

        if (this.isDark) {
            gradient.addColorStop(0, 'rgba(19, 91, 236, 0.2)');
            gradient.addColorStop(0.5, 'rgba(0, 243, 255, 0.05)');
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
        } else {
            gradient.addColorStop(0, 'rgba(19, 91, 236, 0.1)');
            gradient.addColorStop(0.5, 'rgba(0, 243, 255, 0.05)');
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
        }

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
        this.ctx.restore();

        // 2. Draw dots with glow
        this.ctx.save();
        this.ctx.shadowBlur = this.isDark ? 14 : 10;
        this.ctx.shadowColor = currentColors.dot;
        this.ctx.fillStyle = currentColors.dot;

        this.particles.forEach(p => {
            const size = Math.max(0.6, (400 / (400 - p.z)) * 1.6);
            this.ctx.beginPath();
            this.ctx.arc(p.px, p.py, size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.restore();

        this.animationFrameId = requestAnimationFrame((t) => this.animate(t));
    }
}

class Particle {
    x: number;
    y: number;
    z: number;
    px: number = 0;
    py: number = 0;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    rotateY(angle: number) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const x = this.x * cos - this.z * sin;
        const z = this.z * cos + this.x * sin;
        this.x = x;
        this.z = z;
    }

    rotateX(angle: number) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const y = this.y * cos - this.z * sin;
        const z = this.z * cos + this.y * sin;
        this.y = y;
        this.z = z;
    }

    project(width: number, height: number, fov: number) {
        // Weak perspective projection
        const scale = fov / (fov - this.z); // Simple perspective
        this.px = (this.x * scale) + (width / 2);
        this.py = (this.y * scale) + (height / 2);
    }
}

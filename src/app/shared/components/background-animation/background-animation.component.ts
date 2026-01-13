import { Component, ElementRef, HostListener, OnInit, OnDestroy, ViewChild, Inject, PLATFORM_ID, AfterViewInit, effect, Injector, runInInjectionContext } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
    selector: 'app-background-animation',
    standalone: true,
    imports: [CommonModule],
    template: `
    <canvas #canvas class="background-canvas"></canvas>
  `,
    styleUrls: ['./background-animation.component.css']
})
export class BackgroundAnimationComponent implements AfterViewInit, OnDestroy {
    @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
    private ctx!: CanvasRenderingContext2D;
    private animationFrameId!: number;
    private particles: Particle[] = [];
    private numParticles = 100; // Adjust for density
    private sphereRadius = 250; // Radius of the sphere
    private autoRotateSpeed = 0.002;

    // Theme colors
    private isDark = true;
    private colorConfig = {
        dark: { dot: 'rgba(0, 255, 255, 0.9)', line: 'rgba(0, 255, 255, 0.2)' }, // Brighter Cyan for Dark Mode
        light: { dot: 'rgba(19, 91, 236, 0.9)', line: 'rgba(19, 91, 236, 0.25)' }  // Colorful Primary Blue for Light Mode
    };

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private themeService: ThemeService
    ) {
        // Track theme changes using signal effect
        effect(() => {
            this.isDark = this.themeService.darkMode();
        });
    }

    ngAfterViewInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.initCanvas();
            this.createParticles();
            this.animate();
        }
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

    @HostListener('window:resize')
    onResize(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.resizeCanvas();
        }
    }

    private createParticles(): void {
        this.particles = [];
        for (let i = 0; i < this.numParticles; i++) {
            // distribute points on sphere surface using Fibonacci sphere algorithm or random spherical
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos((Math.random() * 2) - 1);

            const x = this.sphereRadius * Math.sin(phi) * Math.cos(theta);
            const y = this.sphereRadius * Math.sin(phi) * Math.sin(theta);
            const z = this.sphereRadius * Math.cos(phi);

            this.particles.push(new Particle(x, y, z));
        }
    }

    private animate(): void {
        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

        // Constant rotation around Y axis
        this.particles.forEach(p => {
            p.rotateY(this.autoRotateSpeed);
            // Optional: slow X rotation for more dynamic feel
            p.rotateX(this.autoRotateSpeed * 0.5);
        });

        // Draw particles and lines
        const currentColors = this.isDark ? this.colorConfig.dark : this.colorConfig.light;

        // Draw central glow
        const centerX = this.canvasRef.nativeElement.width / 2;
        const centerY = this.canvasRef.nativeElement.height / 2;
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, 300);

        if (this.isDark) {
            gradient.addColorStop(0, 'rgba(19, 91, 236, 0.2)'); // Primary color low opacity
            gradient.addColorStop(0.5, 'rgba(0, 243, 255, 0.05)'); // Secondary color very low opacity
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
        } else {
            gradient.addColorStop(0, 'rgba(19, 91, 236, 0.1)');
            gradient.addColorStop(0.5, 'rgba(0, 243, 255, 0.05)');
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
        }

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

        // Projection phase
        this.particles.forEach(p => p.project(this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height, 400));

        // Drawing phase - connections first (behind dots)
        this.ctx.strokeStyle = currentColors.line;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];

                // Euclidean distance in 3D is better for sphere integrity
                const dist = Math.sqrt(
                    Math.pow(p1.x - p2.x, 2) +
                    Math.pow(p1.y - p2.y, 2) +
                    Math.pow(p1.z - p2.z, 2)
                );

                // Draw line if close in 3D space
                if (dist < 60) { // connection threshold
                    this.ctx.moveTo(p1.px, p1.py);
                    this.ctx.lineTo(p2.px, p2.py);
                }
            }
        }
        this.ctx.stroke();

        // Draw dots
        this.ctx.fillStyle = currentColors.dot;
        this.particles.forEach(p => {
            // Scale dot by perspective (optional, simple here)
            // Only draw if z is somewhat positive (front of sphere) or just draw all with opacity? 
            // Drawing all gives transparent glass feel.
            this.ctx.beginPath();
            const size = Math.max(0.5, (400 / (400 - p.z)) * 1.5); // Perspective scaling
            this.ctx.arc(p.px, p.py, size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.animationFrameId = requestAnimationFrame(() => this.animate());
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

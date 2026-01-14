import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-home',
    imports: [RouterLink, CommonModule],
    template: `
    <div class="min-h-screen pb-24 pt-10">
      
      <!-- Hero Section -->
      <section id="hero" class="px-4 py-20 min-h-screen flex items-center justify-center relative over-flow-hidden">
        <!-- Background Glow -->


        <div class="max-w-5xl mx-auto text-center z-10 flex flex-col items-center gap-8">
            
            <!-- Profile Image using simple img tag without complex container for now to ensure reliability -->
            <div class="relative group">
                <div class="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <div class="relative w-40 h-40 md:w-48 md:h-48 rounded-full p-1 bg-white dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-white/10 overflow-hidden text-slate-900 dark:text-white">
                    <img src="assets/pranay_das.jpg" alt="Pranay Das" class="w-full h-full rounded-full object-cover" onerror="this.src='assets/pranay_logo.png'"/>
                </div>
            </div>

            <div class="space-y-6">
                <div class="h-8">
                    <span class="inline-block px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/50 backdrop-blur-md border border-primary/30 text-cyan-700 dark:text-secondary text-sm font-bold uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(19,91,236,0.3)]">
                        {{ currentRole }}<span class="animate-pulse">|</span>
                    </span>
                </div>
                
                <h1 class="text-6xl md:text-8xl font-bold leading-tight tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-400 animate-slide-up relative">
                    <span class="hover:text-shadow-[0_0_30px_rgba(19,91,236,0.5)] dark:hover:text-shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300">PRANAY</span>
                    <br class="md:hidden" />
                    <span class="text-primary hover:text-shadow-[0_0_30px_rgba(19,91,236,0.5)] transition-all duration-300 ml-0 md:ml-4">DAS</span>
                </h1>
                
                <p class="text-slate-600 dark:text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto font-light animate-slide-up" style="animation-delay: 0.2s;">
                    Crafting <span class="text-cyan-700 dark:text-secondary font-medium">immersive digital experiences</span> with precision engineering and creative innovation.
                </p>
            </div>
            
            <div class="flex flex-wrap gap-6 mt-8 justify-center animate-slide-up" style="animation-delay: 0.4s;">
                <a [routerLink]="[]" fragment="experience" class="group relative px-8 py-4 bg-primary text-white font-bold rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(19,91,236,0.5)]">
                    <span class="relative z-10 flex items-center gap-2">
                        Explore Journey <span class="material-symbols-outlined group-hover:translate-y-1 transition-transform">arrow_downward</span>
                    </span>
                    <div class="absolute inset-0 bg-gradient-to-r from-primary via-blue-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </a>
                
                <a [routerLink]="[]" fragment="contact" class="px-8 py-4 rounded-full border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 transition-all hover:text-slate-900 dark:hover:text-white hover:scale-105">
                    Connect
                </a>
            </div>
        </div>
      </section>

      <!-- Skills Section -->
      <section id="skills" class="px-4 py-12 max-w-6xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold mb-10 text-center text-slate-900 dark:text-white">Skills & Tools</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Technical Skills -->
            <div class="glass-card rounded-2xl p-8">
                <h3 class="text-xl font-bold mb-6 text-primary flex items-center gap-2">
                    <span class="material-symbols-outlined">code</span> Technical Skills
                </h3>
                <div class="flex flex-wrap gap-2">
                    <span class="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Angular</span>
                    <span class="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">TypeScript</span>
                    <span class="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">JavaScript</span>
                    <span class="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Node.js</span>
                    <span class="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">MongoDB</span>
                    <span class="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">RxJS</span>
                    <span class="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">NgRx</span>
                    <span class="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Express</span>
                    <span class="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Bootstrap</span>
                    <span class="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Tailwind CSS</span>
                    <span class="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Angular Material</span>
                    <span class="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">React.js</span>
                    <span class="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Vue.js</span>
                </div>
            </div>
            <!-- Tools -->
            <div class="glass-card rounded-2xl p-8">
                <h3 class="text-xl font-bold mb-6 text-primary flex items-center gap-2">
                    <span class="material-symbols-outlined">build</span> Tools & Platforms
                </h3>
                <div class="flex flex-wrap gap-2">
                    <span class="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Git</span>
                    <span class="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Azure</span>
                    <span class="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Bitbucket</span>
                    <span class="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">CloudFlare Pages</span>
                    <span class="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">AWS S3</span>
                    <span class="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">VPS</span>
                    <span class="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">RazorPay</span>
                    <span class="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">AWS EC2</span>
                    <span class="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">VS Code</span>
                    <span class="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Cursor</span>
                </div>
            </div>
        </div>
      </section>

      <!-- Experience Section -->
      <section id="experience" class="px-4 py-20 max-w-5xl mx-auto">
        <h2 class="text-4xl md:text-5xl font-bold mb-16 text-center text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:to-slate-400">
            Professional Journey
        </h2>
        
        <div class="relative pl-8 md:pl-0">
            <!-- Central Line for Desktop -->
            <div class="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-secondary/50 to-primary/50 -translate-x-1/2"></div>
            
            <!-- Mobile Line -->
            <div class="md:hidden absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 via-secondary/50 to-primary/50"></div>

            <div class="space-y-12 md:space-y-24">
                <!-- United Infotech -->
                <div class="relative flex flex-col md:flex-row gap-8 md:gap-0 items-center">
                    <div class="md:w-1/2 md:pr-12 md:text-right order-2 md:order-1">
                        <div class="glass-card p-8 rounded-2xl hover:neon-border transition-all duration-300 relative group">
                            <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-1">Associate/Senior Software Engineer</h3>
                            <p class="text-primary dark:text-secondary font-medium text-lg mb-4">United Infotech Remote</p>
                            <div class="space-y-4 text-slate-700 dark:text-slate-300 text-sm leading-relaxed text-left">
                                <div>
                                    <h4 class="font-bold text-slate-800 dark:text-white mb-1">Boards And Beyond (McGraw Hill) & CQFluency</h4>
                                    <ul class="list-disc list-inside space-y-1 marker:text-primary">
                                        <li>Optimized frontend with Angular 12/13.</li>
                                        <li>Implemented accessibility & Pendo analytics.</li>
                                        <li>Migrated CKEditor4 to 5 with AWS S3.</li>
                                        <li>Engineered enterprise workflows & RBAC.</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Timeline Node -->
                    <div class="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full ring-4 ring-primary/20 z-10 md:order-2">
                        <div class="absolute inset-0 bg-secondary rounded-full animate-ping opacity-20"></div>
                    </div>
                    
                    <div class="md:w-1/2 md:pl-12 order-1 md:order-3 self-start md:self-center">
                        <span class="inline-block px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 border border-primary/30 text-primary font-bold shadow-[0_0_10px_rgba(19,91,236,0.2)] whitespace-nowrap">
                            Jun 2024 - Present
                        </span>
                    </div>
                </div>

                <!-- ITC INFOTECH -->
                <div class="relative flex flex-col md:flex-row gap-8 md:gap-0 items-center">
                    <div class="md:w-1/2 md:pr-12 md:text-right order-1 md:order-1 self-start md:self-center">
                         <span class="inline-block px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 border border-primary/30 text-primary font-bold shadow-[0_0_10px_rgba(19,91,236,0.2)] whitespace-nowrap">
                            Mar 2022 - Mar 2024
                        </span>
                    </div>
                    
                    <!-- Timeline Node -->
                    <div class="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full ring-4 ring-primary/20 z-10 md:order-2"></div>
                    
                    <div class="md:w-1/2 md:pl-12 order-2 md:order-3">
                        <div class="glass-card p-8 rounded-2xl hover:neon-border transition-all duration-300 relative group">
                            <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-1">Associate IT Consultant</h3>
                            <p class="text-primary dark:text-secondary font-medium text-lg mb-4">ITC INFOTECH</p>
                            <div class="space-y-4 text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                <h4 class="font-bold text-slate-800 dark:text-white mb-1">Mondee Inc. (USA)</h4>
                                <ul class="list-disc list-inside space-y-1 marker:text-primary">
                                    <li>Scaled core Hotel booking module.</li>
                                    <li>Integrated Google Places API & Maps.</li>
                                    <li>Developed advanced search & trip cancellation.</li>
                                    <li>Implemented Auth, Guards & i18n.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- TCS -->
                <div class="relative flex flex-col md:flex-row gap-8 md:gap-0 items-center">
                     <div class="md:w-1/2 md:pr-12 md:text-right order-2 md:order-1">
                        <div class="glass-card p-8 rounded-2xl hover:neon-border transition-all duration-300 relative group">
                            <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-1">Systems Engineer</h3>
                            <p class="text-primary dark:text-secondary font-medium text-lg mb-4">TATA Consultancy Services</p>
                            <div class="space-y-4 text-slate-700 dark:text-slate-300 text-sm leading-relaxed text-left">
                                <ul class="list-disc list-inside space-y-1 marker:text-primary">
                                     <li><strong>OLD Mutual SA:</strong> Angular 4 to 8 migration, Tree shaking.</li>
                                     <li><strong>CITI BANK:</strong> Legacy JS/Flex to Angular migration.</li>
                                     <li><strong>CITI Singapore:</strong> XML to Angular 12, Mentoring.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Timeline Node -->
                    <div class="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full ring-4 ring-primary/20 z-10 md:order-2"></div>
                    
                    <div class="md:w-1/2 md:pl-12 order-1 md:order-3 self-start md:self-center">
                        <span class="inline-block px-4 py-2 rounded-full bg-white/80 dark:bg-slate-900/80 border border-primary/30 text-primary font-bold shadow-[0_0_10px_rgba(19,91,236,0.2)] whitespace-nowrap">
                            Mar 2018 - Mar 2022
                        </span>
                    </div>
                </div>
            </div>
        </div>
      </section>

      <!-- Projects Section -->
      <section id="projects" class="px-4 py-20 max-w-7xl mx-auto">
        <h2 class="text-4xl md:text-5xl font-bold mb-16 text-center text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:to-slate-400">Featured Projects</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Project 1 -->
            <div class="tilt-card group relative">
                <div class="glass-card rounded-[2rem] p-8 h-full flex flex-col hover:border-primary/50 transition-all duration-300 relative z-10 bg-white/50 dark:bg-slate-900/40">
                    <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]"></div>
                    
                    <div class="relative z-10 flex flex-col h-full">
                         <div class="flex justify-between items-start mb-4">
                            <h3 class="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Presmistique</h3>
                            <span class="material-symbols-outlined text-slate-600 dark:text-slate-400 group-hover:text-secondary animate-pulse">auto_awesome</span>
                        </div>
                        
                        <p class="text-slate-600 dark:text-slate-300 text-sm mb-6 flex-grow leading-relaxed">
                            AI-powered resume builder featuring <strong>Google Gemini 2.5 Flash</strong> integration for intelligent parsing, keyword enhancement, and ATS scoring.
                        </p>
                        
                        <div class="space-y-4">
                            <div class="flex flex-wrap gap-2">
                                <span class="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-secondary border border-slate-300 dark:border-secondary/20">React</span>
                                <span class="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-secondary border border-slate-300 dark:border-secondary/20">Node.js</span>
                                <span class="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-secondary border border-slate-300 dark:border-secondary/20">Gemini AI</span>
                            </div>
                            
                            <div class="flex gap-3 pt-4 border-t border-slate-200 dark:border-white/5">
                                <a href="https://presmistique.in" target="_blank" class="flex-1 py-2 text-center rounded-lg bg-primary/20 hover:bg-primary/40 text-primary font-bold text-sm transition-colors flex items-center justify-center gap-2">
                                    <span class="material-symbols-outlined text-base">rocket_launch</span> Live Demo
                                </a>
                                <a href="https://github.com/Pranayd555/Resume-Builder" target="_blank" class="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-colors">
                                    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" class="w-5 h-5 dark:invert" alt="GitHub"/>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Project 2 -->
             <div class="tilt-card group relative">
                <div class="glass-card rounded-[2rem] p-8 h-full flex flex-col hover:border-primary/50 transition-all duration-300 relative z-10 bg-white/50 dark:bg-slate-900/40">
                    <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]"></div>
                    
                    <div class="relative z-10 flex flex-col h-full">
                         <div class="flex justify-between items-start mb-4">
                            <h3 class="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">CKEditor 5 Plugin</h3>
                            <span class="material-symbols-outlined text-slate-600 dark:text-slate-400 group-hover:text-secondary">extension</span>
                        </div>
                        
                        <p class="text-slate-600 dark:text-slate-300 text-sm mb-6 flex-grow leading-relaxed">
                             Custom build with proprietary file upload adapter, integrating <strong>AWS S3</strong> and <strong>Cloudflare R2</strong> for enterprise-grade asset management.
                        </p>
                        
                        <div class="space-y-4">
                            <div class="flex flex-wrap gap-2">
                                <span class="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-secondary border border-slate-300 dark:border-secondary/20">CKEditor 5</span>
                                <span class="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-secondary border border-slate-300 dark:border-secondary/20">AWS S3</span>
                                <span class="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-secondary border border-slate-300 dark:border-secondary/20">TypeScript</span>
                            </div>
                            
                            <div class="flex gap-3 pt-4 border-t border-slate-200 dark:border-white/5">
                                <a href="https://github.com/Pranayd555/ckEditor5" target="_blank" class="flex-1 py-2 text-center rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-sm transition-colors flex items-center justify-center gap-2">
                                     <span class="material-symbols-outlined text-base">code</span> View Code
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Project 3 -->
             <div class="tilt-card group relative">
                <div class="glass-card rounded-[2rem] p-8 h-full flex flex-col hover:border-primary/50 transition-all duration-300 relative z-10 bg-white/50 dark:bg-slate-900/40">
                    <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]"></div>
                    
                    <div class="relative z-10 flex flex-col h-full">
                         <div class="flex justify-between items-start mb-4">
                            <h3 class="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Fruit Basket</h3>
                            <span class="material-symbols-outlined text-slate-600 dark:text-slate-400 group-hover:text-secondary">shopping_basket</span>
                        </div>
                        
                        <p class="text-slate-600 dark:text-slate-300 text-sm mb-6 flex-grow leading-relaxed">
                             Full-stack e-commerce simulation with <strong>NgRx</strong> state management, custom directives, and complex form validations.
                        </p>
                        
                        <div class="space-y-4">
                            <div class="flex flex-wrap gap-2">
                                <span class="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-secondary border border-slate-300 dark:border-secondary/20">Angular</span>
                                <span class="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-secondary border border-slate-300 dark:border-secondary/20">NgRx</span>
                                <span class="text-[10px] uppercase tracking-wider px-2 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-secondary border border-slate-300 dark:border-secondary/20">MongoDB</span>
                            </div>
                            
                            <div class="flex gap-3 pt-4 border-t border-slate-200 dark:border-white/5">
                                <a href="https://github.com/Pranayd555/ZeRo" target="_blank" class="flex-1 py-2 text-center rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-sm transition-colors flex items-center justify-center gap-2">
                                     <span class="material-symbols-outlined text-base">code</span> View Code
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>
      
      <!-- Skills Section -->
      <section id="skills" class="px-4 py-20 max-w-6xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold mb-10 text-center text-slate-900 dark:text-white">Technical Arsenal</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Technical Skills -->
            <div class="glass-card rounded-2xl p-8 hover:neon-border transition-all duration-500">
                <h3 class="text-xl font-bold mb-6 text-primary flex items-center gap-2">
                    <span class="material-symbols-outlined animate-pulse">code</span> 
                    Core Technologies
                </h3>
                <div class="flex flex-wrap gap-3">
                    <span class="px-4 py-2 rounded-lg bg-white/80 dark:bg-slate-800/50 hover:bg-primary/20 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 hover:border-primary/50 transition-all cursor-crosshair">Angular</span>
                    <span class="px-4 py-2 rounded-lg bg-white/80 dark:bg-slate-800/50 hover:bg-primary/20 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 hover:border-primary/50 transition-all cursor-crosshair">TypeScript</span>
                    <span class="px-4 py-2 rounded-lg bg-white/80 dark:bg-slate-800/50 hover:bg-primary/20 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 hover:border-primary/50 transition-all cursor-crosshair">JavaScript (ES6+)</span>
                    <span class="px-4 py-2 rounded-lg bg-white/80 dark:bg-slate-800/50 hover:bg-primary/20 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 hover:border-primary/50 transition-all cursor-crosshair">Node.js</span>
                    <span class="px-4 py-2 rounded-lg bg-white/80 dark:bg-slate-800/50 hover:bg-primary/20 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 hover:border-primary/50 transition-all cursor-crosshair">RxJS & NgRx</span>
                    <span class="px-4 py-2 rounded-lg bg-white/80 dark:bg-slate-800/50 hover:bg-primary/20 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 hover:border-primary/50 transition-all cursor-crosshair">MongoDB</span>
                    <span class="px-4 py-2 rounded-lg bg-white/80 dark:bg-slate-800/50 hover:bg-primary/20 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 hover:border-primary/50 transition-all cursor-crosshair">Tailwind CSS</span>
                </div>
            </div>
            <!-- Tools -->
            <div class="glass-card rounded-2xl p-8 hover:neon-border transition-all duration-500">
                <h3 class="text-xl font-bold mb-6 text-primary flex items-center gap-2">
                    <span class="material-symbols-outlined animate-spin-slow">settings</span> 
                    DevOps & Tools
                </h3>
                <div class="flex flex-wrap gap-3">
                    <span class="px-4 py-2 rounded-lg bg-white/80 dark:bg-slate-800/50 hover:bg-secondary/20 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 hover:border-secondary/50 transition-all cursor-crosshair">Git</span>
                    <span class="px-4 py-2 rounded-lg bg-white/80 dark:bg-slate-800/50 hover:bg-secondary/20 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 hover:border-secondary/50 transition-all cursor-crosshair">AWS (S3, EC2)</span>
                    <span class="px-4 py-2 rounded-lg bg-white/80 dark:bg-slate-800/50 hover:bg-secondary/20 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 hover:border-secondary/50 transition-all cursor-crosshair">Cloudflare</span>
                    <span class="px-4 py-2 rounded-lg bg-white/80 dark:bg-slate-800/50 hover:bg-secondary/20 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 hover:border-secondary/50 transition-all cursor-crosshair">Bitbucket</span>
                    <span class="px-4 py-2 rounded-lg bg-white/80 dark:bg-slate-800/50 hover:bg-secondary/20 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 hover:border-secondary/50 transition-all cursor-crosshair">Cursor AI</span>
                </div>
            </div>
        </div>
      </section>
      
      <!-- Education & Certifications -->
      <section id="education" class="px-4 py-12 max-w-5xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="glass-card rounded-2xl p-8">
                <h2 class="text-2xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined">school</span> Education
                </h2>
                <div class="space-y-6">
                    <div>
                        <h3 class="font-bold text-slate-800 dark:text-slate-200">B. Tech</h3>
                        <p class="text-sm text-slate-600 dark:text-slate-400">West Bengal University of Technology (Jan 2017)</p>
                        <p class="text-xs font-semibold text-primary mt-1">GPA: 7.65 (7.65/CGPA)</p>
                    </div>
                    <div>
                        <h3 class="font-bold text-slate-800 dark:text-slate-200">W.B.C.H.S.E (Higher Secondary)</h3>
                        <p class="text-sm text-slate-600 dark:text-slate-400">Barasat P.C.S. Govt. High School (Jan 2013)</p>
                        <p class="text-xs font-semibold text-primary mt-1">GPA: 76.6</p>
                    </div>
                </div>
            </div>
            
            <div class="glass-card rounded-2xl p-8">
                <h2 class="text-2xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined">verified</span> Certifications
                </h2>
                <ul class="space-y-3 text-sm text-slate-700 dark:text-slate-400">
                    <li class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        Angular Intermediate (HackerRank)
                    </li>
                    <li class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        Front-end Javascript Frameworks: Angular (HKUST)
                    </li>
                    <li class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        Building Interactive Web Pages Using Modern Javascript (NIIT)
                    </li>
                    <li class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        Javascript Basics (UC Davis)
                    </li>
                    <li class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        HTML and CSS in depth (Meta)
                    </li>
                </ul>
            </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section id="contact" class="px-4 py-20 max-w-4xl mx-auto text-center relative z-10">
            <div class="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent -z-10 blur-3xl"></div>
            
            <h2 class="text-4xl md:text-5xl font-bold mb-12 text-slate-900 dark:text-white">Ready to Innovate?</h2>
            
            <div class="rounded-[3rem] p-10 md:p-16 inline-flex flex-col items-center gap-8 relative overflow-hidden group transition-transform duration-300 hover:scale-[1.02] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-slate-800 shadow-2xl">
                <div class="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150 pointer-events-none"></div>
                
                <p class="text-slate-600 dark:text-slate-300 md:text-xl max-w-lg mx-auto leading-relaxed relative z-10">
                    Looking for a <span class="text-cyan-700 dark:text-secondary font-bold">visionary engineer</span> to elevate your digital presence? Let's build the future together.
                </p>
                
                <div class="flex flex-wrap gap-6 justify-center relative z-10">
                    <a href="mailto:pranaydaspr@gmail.com" class="px-8 py-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:scale-105 transition-transform shadow-lg flex items-center gap-2 group/btn">
                        <span class="material-symbols-outlined group-hover/btn:rotate-12 transition-transform text-white dark:text-primary">mail</span> 
                        <span>Send Message</span>
                    </a>
                    
                    <a href="https://linkedin.com/in/pranay-das" target="_blank" class="px-8 py-4 rounded-full border border-slate-300 dark:border-slate-600 hover:border-slate-900 dark:hover:border-white text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold transition-all hover:bg-slate-100 dark:hover:bg-white/5 flex items-center gap-2">
                        <span>LinkedIn</span>
                        <span class="material-symbols-outlined text-sm">open_in_new</span>
                    </a>
                </div>
            </div>
            
      </section>
    </div>
  `,
    styles: ``
})
export class HomeComponent implements OnInit, OnDestroy {
    currentRole = '';
    private roles = ['Sr. Software Engineer', 'Full Stack Web Developer', 'Product Engineer', 'Active Learner'];
    loopNum = 0;
    private isDeleting = false;
    private typeSpeed = 150;
    private timer: any;

    constructor(
        @Inject(PLATFORM_ID) private platformId: Object,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.type();
        } else {
            this.currentRole = this.roles[0]; // Fallback for SSR
        }
    }

    ngOnDestroy() {
        if (this.timer) clearTimeout(this.timer);
    }

    private type() {
        const i = this.loopNum % this.roles.length;
        const fullTxt = this.roles[i];

        if (this.isDeleting) {
            this.currentRole = fullTxt.substring(0, this.currentRole.length - 1);
        } else {
            this.currentRole = fullTxt.substring(0, this.currentRole.length + 1);
        }

        this.cdr.markForCheck();

        let delta = 200 - Math.random() * 100;

        if (this.isDeleting) { delta /= 2; }

        if (!this.isDeleting && this.currentRole === fullTxt) {
            delta = 2000; // Wait at end
            this.isDeleting = true;
        } else if (this.isDeleting && this.currentRole === '') {
            this.isDeleting = false;
            this.loopNum++;
            delta = 500;
        }

        this.timer = setTimeout(() => this.type(), delta);
    }
}

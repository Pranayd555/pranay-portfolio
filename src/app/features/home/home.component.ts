import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-home',
    imports: [RouterLink, CommonModule],
    template: `
    <div class="min-h-screen pb-24 pt-10">
      
      <!-- Hero Section -->
      <section id="hero" class="px-4 py-12 max-w-5xl mx-auto text-center">
        <div class="rounded-2xl p-10 md:p-16 flex flex-col items-center gap-8 animate-slide-up relative overflow-hidden">
            <!-- Profile Image -->
            <div class="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-primary/30 p-1 shadow-2xl relative z-10">
                <img src="assets/pranay_das.jpg" alt="Pranay Das" class="w-full h-full rounded-full object-cover bg-slate-800" onerror="this.src='https://ui-avatars.com/api/?name=Pranay+Das&background=135bec&color=fff&size=200'"/>
            </div>

            <div class="space-y-4 relative z-10">
                <span class="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold uppercase tracking-widest border border-primary/20">
                    Sr. Software Engineer
                </span>
                <h1 class="text-5xl md:text-7xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
                    PRANAY DAS
                </h1>
                <p class="text-slate-500 dark:text-slate-300 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
                    Committed to delivering exceptional user experiences while adhering to best practices in web development. Seeking to leverage my expertise in full-stack development to contribute to innovative projects and drive continuous improvement within a dynamic team environment.
                </p>
            </div>
            
            <div class="flex flex-wrap gap-4 mt-2 justify-center relative z-10">
                <a [routerLink]="[]" fragment="experience" class="px-8 py-3 rounded-full bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all transform hover:-translate-y-1 cursor-pointer">
                    View Experience
                </a>
                <a [routerLink]="[]" fragment="contact" class="px-8 py-3 rounded-full glass-card border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
                    Contact Me
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
      <section id="experience" class="px-4 py-12 max-w-5xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold mb-10 text-center text-slate-900 dark:text-white">Professional Experience</h2>
        
        <div class="space-y-8">
            <!-- United Infotech -->
            <div class="glass-card rounded-2xl p-8 transition-colors hover:border-primary/30">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
                    <div>
                        <h3 class="text-2xl font-bold text-slate-900 dark:text-white">Associate/Senior Software Engineer</h3>
                        <p class="text-primary font-medium text-lg">United Infotech Remote</p>
                    </div>
                    <span class="px-4 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold border border-slate-200 dark:border-slate-700">Jun 2024 - Present</span>
                </div>
                
                <div class="space-y-6">
                    <div>
                        <h4 class="font-bold text-slate-800 dark:text-slate-200 mb-2">Boards And Beyond (McGraw Hill)</h4>
                        <ul class="list-disc list-outside ml-5 space-y-2 text-slate-600 dark:text-slate-400">
                            <li>Developed, optimized, and debugged critical frontend features using Angular 12/13.</li>
                            <li>Implemented comprehensive accessibility features including narrator support within Learners application.</li>
                            <li>Integrated Pendo analytics to gather crucial user behavior data.</li>
                            <li>Spearheaded R&D for CKEditor4 to CKEditor5 migration; implemented custom integration with AWS S3 file manager.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-bold text-slate-800 dark:text-slate-200 mb-2">CQFluency</h4>
                        <ul class="list-disc list-outside ml-5 space-y-2 text-slate-600 dark:text-slate-400">
                            <li>Spearheaded end-to-end frontend development across diverse enterprise UIs (PM, Customer, Admin).</li>
                            <li>Engineered critical enterprise workflows (job, order, quote) with robust state synchronization.</li>
                            <li>Managed complex pricing and CAT (Computer-Assisted Translation) interface logic.</li>
                            <li>Fortified robust Role-Based Access Control (RBAC) and impersonation flows.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-bold text-slate-800 dark:text-slate-200 mb-2">Sun Social Network</h4>
                        <ul class="list-disc list-outside ml-5 space-y-2 text-slate-600 dark:text-slate-400">
                            <li>Optimized feed and interaction reliability across core modules; reduced user-reported slowness.</li>
                            <li>Deployed real-time push notifications leveraging Google Firebase.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- ITC INFOTECH -->
            <div class="glass-card rounded-2xl p-8 transition-colors hover:border-primary/30">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
                    <div>
                        <h3 class="text-2xl font-bold text-slate-900 dark:text-white">Associate IT Consultant</h3>
                        <p class="text-primary font-medium text-lg">ITC INFOTECH</p>
                    </div>
                    <span class="px-4 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold border border-slate-200 dark:border-slate-700">Mar 2022 - Mar 2024</span>
                </div>
                <div>
                     <h4 class="font-bold text-slate-800 dark:text-slate-200 mb-2">Mondee Inc. (USA)</h4>
                     <ul class="list-disc list-outside ml-5 space-y-2 text-slate-600 dark:text-slate-400">
                        <li>Optimized and scaled the core Hotel booking module.</li>
                        <li>Integrated Google Places API for advanced location services.</li>
                        <li>Developed advanced search features and client-side trip cancellation.</li>
                        <li>Implemented authentication, Guards, Resolvers, and HTTP Interceptors.</li>
                        <li>Led Internationalization (i18n) implementation for multiple languages/currencies.</li>
                     </ul>
                </div>
            </div>

            <!-- TCS -->
            <div class="glass-card rounded-2xl p-8 transition-colors hover:border-primary/30">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
                    <div>
                        <h3 class="text-2xl font-bold text-slate-900 dark:text-white">Systems Engineer</h3>
                        <p class="text-primary font-medium text-lg">TATA Consultancy Services</p>
                    </div>
                    <span class="px-4 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-bold border border-slate-200 dark:border-slate-700">Mar 2018 - Mar 2022</span>
                </div>
                <div class="space-y-4">
                    <ul class="list-disc list-outside ml-5 space-y-2 text-slate-600 dark:text-slate-400">
                         <li><strong>OLD Mutual SA:</strong> Development of cross-browser scalable application. Migrated Angular 4 to 8. Responsible for Code Optimization and tree shaking.</li>
                         <li><strong>CITI BANK Migration Demo:</strong> Migrated legacy JavaScript to Angular 2 and Adobe Flex to Angular 7.</li>
                         <li><strong>CITI Bank Singapore:</strong> Migrated profiling application from XML to Angular 12. Mentored freshers.</li>
                    </ul>
                </div>
            </div>
        </div>
      </section>

      <!-- Projects Section -->
      <section id="projects" class="px-4 py-12 max-w-6xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold mb-10 text-center text-slate-900 dark:text-white">Featured Projects</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Project 1 -->
            <div class="glass-card rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 flex flex-col h-full group">
                <h3 class="text-xl font-bold mb-2 text-slate-900 dark:text-white group-hover:text-primary transition-colors">Presmistique - Resume Builder</h3>
                <p class="text-slate-500 dark:text-slate-400 text-sm mb-4 flex-grow">
                    Designed and developed a full-stack resume builder. Implemented AI-powered parsing with Google Gemini 2.5 Flash, keyword enhancement, and ATS score analysis.
                </p>
                <div class="flex flex-wrap gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <span class="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">React</span>
                    <span class="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Node.js</span>
                    <span class="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Google Gemini</span>
                </div>
            </div>

            <!-- Project 2 -->
            <div class="glass-card rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 flex flex-col h-full group">
                <h3 class="text-xl font-bold mb-2 text-slate-900 dark:text-white group-hover:text-primary transition-colors">CkEditor5 Custom Plugin</h3>
                <p class="text-slate-500 dark:text-slate-400 text-sm mb-4 flex-grow">
                     Custom CKEditor 5 build featuring proprietary in-house file upload and advanced asset management. Integrated with Amazon S3 and Cloudflare R2.
                </p>
                <div class="flex flex-wrap gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <span class="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">CKEditor 5</span>
                    <span class="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">AWS S3</span>
                    <span class="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">TypeScript</span>
                </div>
            </div>

             <!-- Project 3 -->
             <div class="glass-card rounded-2xl p-6 hover:border-primary/50 transition-all duration-300 flex flex-col h-full group">
                <h3 class="text-xl font-bold mb-2 text-slate-900 dark:text-white group-hover:text-primary transition-colors">Fruit Basket</h3>
                <p class="text-slate-500 dark:text-slate-400 text-sm mb-4 flex-grow">
                     Full-stack application with Login, Register, NgRx Store, and custom directives. Based on implementing complex features and continuous learning.
                </p>
                <div class="flex flex-wrap gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <span class="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Angular</span>
                    <span class="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">NgRx</span>
                    <span class="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">MongoDB</span>
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
                        <p class="text-sm text-slate-500 dark:text-slate-400">Narula Institute of Technology (Jan 2017)</p>
                        <p class="text-xs font-semibold text-primary mt-1">GPA: 7.65 (7.65/CGPA)</p>
                    </div>
                    <div>
                        <h3 class="font-bold text-slate-800 dark:text-slate-200">W.B.C.H.S.E (Higher Secondary)</h3>
                        <p class="text-sm text-slate-500 dark:text-slate-400">Barasat P.C.S. Govt. High School (Jan 2013)</p>
                        <p class="text-xs font-semibold text-primary mt-1">GPA: 76.6</p>
                    </div>
                </div>
            </div>
            
            <div class="glass-card rounded-2xl p-8">
                <h2 class="text-2xl font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                    <span class="material-symbols-outlined">verified</span> Certifications
                </h2>
                <ul class="space-y-3 text-sm text-slate-600 dark:text-slate-400">
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
      <section id="contact" class="px-4 py-16 max-w-4xl mx-auto text-center">
            <h2 class="text-3xl font-bold mb-8 text-slate-900 dark:text-white">Get In Touch</h2>
            <div class="glass-card rounded-2xl p-8 md:p-12 inline-flex flex-col items-center gap-4">
                <p class="text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-4">
                    Looking for a senior engineer to join your team or have a project in mind? Let's connect!
                </p>
                <div class="flex flex-wrap gap-4 justify-center">
                    <a href="mailto:pranaydaspr@gmail.com" class="px-6 py-3 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-opacity flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm">mail</span> Email Me
                    </a>
                    <a href="https://linkedin.com/in/pranay-das" target="_blank" class="px-6 py-3 rounded-full border-2 border-slate-200 dark:border-slate-700 hover:border-primary text-slate-700 dark:text-slate-300 font-bold transition-all flex items-center gap-2">
                        LinkedIn
                    </a>
                </div>
            </div>
      </section>
    </div>
  `,
    styles: ``
})
export class HomeComponent { }

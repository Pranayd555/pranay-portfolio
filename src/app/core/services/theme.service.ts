import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private platformId = inject(PLATFORM_ID);

    // Default to dark mode if no preference found
    darkMode = signal<boolean>(true);

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                this.darkMode.set(savedTheme === 'dark');
            } else {
                this.darkMode.set(true);
            }
        }

        // Effect to apply class to html element
        effect(() => {
            if (isPlatformBrowser(this.platformId)) {
                const isDark = this.darkMode();
                const html = document.documentElement;

                if (isDark) {
                    html.classList.add('dark');
                    localStorage.setItem('theme', 'dark');
                } else {
                    html.classList.remove('dark');
                    localStorage.setItem('theme', 'light');
                }
            }
        });
    }

    toggleTheme() {
        this.darkMode.update(d => !d);
    }
}

import { ChangeDetectionStrategy, Component, effect, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationStart, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-floating-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './floating-nav.html',
  styleUrl: './floating-nav.css'
})
export class FloatingNavComponent {

    navOpen = signal(false);
    projOpen = signal(false);
    private router = inject(Router);

    constructor(){
      this.router.events.pipe(
        takeUntilDestroyed()
      ).subscribe(
        (e)=> {
          if(e instanceof NavigationStart) {
            this.closeNav();
          }
        }
      )
    }

    @HostListener('document:keydown.escape', ['$event'])
    handleEsc(event: Event) {
      this.closeNav();
    }

  

 
    openNav() {
      this.navOpen.set(true);
    }
 
    closeNav() {
      this.navOpen.set(false);
      this.projOpen.set(false);
    }
 
    toggleNav() { 
      this.navOpen.update( v => !v);
     }
 
    toggleProjects() {
      this.projOpen.update( v => !v);
    }
 
    
 
    setActive() {
      
    }
 }

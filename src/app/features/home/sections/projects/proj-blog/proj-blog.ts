import { HttpClient } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, PLATFORM_ID, SecurityContext, signal } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { blogMap } from './proj-blog.config';
import { GeminiAi } from '../../../../../services/gemini-ai';

@Component({
  selector: 'app-proj-blog',
  imports: [],
  templateUrl: './proj-blog.html',
  styleUrl: './proj-blog.css',
})
export class ProjBlog {
  route = inject(ActivatedRoute);
  http = inject(HttpClient);
  sanitizer = inject(DomSanitizer);
  destroyRef = inject(DestroyRef);
  document = inject(DOCUMENT);
  content = signal<SafeHtml|null>('');
  path:string | null = null;
  loadingMedia = signal(true);     // iframe / gif loading

  private cache = new Map<string, any>();

  private platformId = inject(PLATFORM_ID);
  isBrowser = signal(isPlatformBrowser(this.platformId));
  GeminiAI = inject(GeminiAi);


  ngOnInit() {
    this.route.params
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((params) => {
      this.path = String(params['project'] ?? '');
      const file = blogMap[this.path] || '';

      this.loadingMedia.set(['codelens-graph', 'presmistique', 'fruit-basket', 'ckeditor-plugin'].includes(this.path));

      if (!file) {
        this.content.set(null);
        return;
      }

      if(this.isBrowser()) this.getHTML(file);
    });
  }

  getHTML(file: string) {
    if (this.cache.has(file)) {
      this.content.set(this.cache.get(file));
      return;
    }
  
    this.http
          .get(file, { responseType: 'text' })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((res) =>{
            const view = this.sanitizer.bypassSecurityTrustHtml(res);
            this.cache.set(file, view); // ✅ cache it
            this.content.set(view)
          }
          );
  }


  sanitizedDemoUrl = computed(() => {
    const videoId = 'QkUQtSjI6DE'; // use env variables

    // Security: Validate videoId format (alphanumeric, hyphens, underscores, 11 chars)
    const youtubeIdRegex = /^[a-zA-Z0-9_-]{11}$/;
    if (videoId && youtubeIdRegex.test(videoId)) {
      // Use youtube-nocookie.com for privacy (doesn't set tracking cookies)
      // Parameters: rel=0 (no related videos), modestbranding=1 (no logo), iv_load_policy=3 (no annotations)
      const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3`;
      return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    } else if (videoId) {
      console.warn(`[Security] Invalid YouTube Video ID detected: ${videoId}`);
    }

    return null;
  });

  showChat() {
    this.GeminiAI.showChat.next(true);
  }

}

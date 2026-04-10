import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, SecurityContext, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { blogMap } from './proj-blog.config';

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
  content = signal<string|null>('');
  path = '';


  ngOnInit() {
    this.route.params
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((params) => {
      this.path = String(params['project'] ?? '');
      const file = blogMap[this.path] || '';

      if (!file) {
        this.content.set(null);
        return;
      }

      this.getHTML(file);
    });
  }

  getHTML(file: string) {
    this.http
          .get(file, { responseType: 'text' })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((res) =>{
            const view = this.sanitizer.sanitize(SecurityContext.HTML, res);
            this.content.set(view)
          }
          );
  }

}

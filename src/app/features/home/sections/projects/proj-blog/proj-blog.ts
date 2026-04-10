import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, SecurityContext, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

  constructor() {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const project = String(params['project'] ?? '');
        const file = project === 'ckeditor' ? 'assets/blogs/ckeditor-blog.html' : null;

        if (!file) {
          this.content.set(null);
          return;
        }

        this.http
          .get(file, { responseType: 'text' })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((res) =>
            this.content.set(this.sanitizer.sanitize(SecurityContext.HTML, res))
          );
      });
  }

  onContentClick(event: MouseEvent) {
    const target = event.target as Element | null;
    const anchor = target?.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href') ?? '';
    if (href === '' || href === '#') {
      event.preventDefault();
      return;
    }

    if (!href.startsWith('#')) return;

    event.preventDefault();
    const id = href.slice(1);
    if (!id) return;

    // Keep the hash in the address bar without triggering a route reload.
    try {
      const loc = this.document.location;
      const nextUrl = `${loc.pathname}${loc.search}#${id}`;
      this.document.defaultView?.history.replaceState(null, '', nextUrl);
    } catch {
      // no-op
    }

    const el = this.document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

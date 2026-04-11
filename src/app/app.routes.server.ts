import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'projects/:project',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      return [
        { project: 'presmistique' },
        { project: 'ckeditor-plugin' },
        { project: 'fruit-basket' }
      ];
    }
  },

  // fallback for other routes
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
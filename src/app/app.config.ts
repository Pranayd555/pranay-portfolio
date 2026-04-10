import { ApplicationConfig, provideBrowserGlobalErrorListeners, isDevMode, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withInMemoryScrolling({
      anchorScrolling: 'enabled',
      scrollPositionRestoration: 'enabled'
    })),
    provideClientHydration(withEventReplay()),
    provideStore(),
    provideEffects(),
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(), // 👈 VERY IMPORTANT
      trace: true,
      traceLimit: 75
    }),
    provideHttpClient(withFetch()),
  ]
};

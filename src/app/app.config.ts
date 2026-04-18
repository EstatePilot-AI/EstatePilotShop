import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';

import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader, provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslationService } from './core/services/translation.service';
import { MessageService } from 'primeng/api';
import { errorInterceptor } from './core/interceptors/error.interceptor';

const EstatePilotPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#e8f5f0',
      100: '#d4ede4',
      200: '#a8dbc6',
      300: '#7dc9a8',
      400: '#4db88a',
      500: '#2d8b6e',
      600: '#22614f',
      700: '#1a4d3e',
      800: '#143d31',
      900: '#0d2f26',
    },
    colorScheme: {
      light: {
        primary: {
          color: '#1a4d3e',
          contrastColor: '#ffffff',
          hoverColor: '#22614f',
          activeColor: '#2d8b6e',
        },
        highlight: {
          background: '#e8f5f0',
          focusBackground: '#d4ede4',
          color: '#1a4d3e',
          focusColor: '#22614f',
        },
        surface: {
          0: '#ffffff',
          50: '#fdfbf7',
          100: '#f8f4ed',
          200: '#f0e9dc',
          300: '#e8dfd0',
          400: '#8b8b9e',
          500: '#d4c9b8',
          600: '#3d3d56',
          700: '#1a1a2e',
          800: '#0f0f1a',
          900: '#080b10',
        },
      },
      dark: {
        primary: {
          color: '#34a87a',
          contrastColor: '#080b10',
          hoverColor: '#4cc692',
          activeColor: '#7ddaaf',
        },
        highlight: {
          background: 'rgba(52, 168, 122, 0.16)',
          focusBackground: 'rgba(52, 168, 122, 0.24)',
          color: 'rgba(255,255,255,.87)',
          focusColor: 'rgba(255,255,255,.87)',
        },
        surface: {
          0: '#080b10',
          50: '#0d1117',
          100: '#161b22',
          200: '#21262d',
          300: '#30363d',
          400: '#7d8590',
          500: '#c9cdd1',
          600: '#e8dfd0',
          700: '#f0e9dc',
          800: '#f8f4ed',
          900: '#ffffff',
        },
        text: {
          color: '#f0ead6',
          hoverColor: '#f8f4ed',
          mutedColor: '#7d8590',
          hoverMutedColor: '#c9cdd1',
        },
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch(), withInterceptors([errorInterceptor])),
    MessageService,
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
    ),
    // provideClientHydration(withEventReplay()),
    providePrimeNG({
      theme: {
        preset: EstatePilotPreset,
        options: {
          darkModeSelector: 'body.dark',
        },
      },
    }),
    // ── i18n ──────────────────────────────────────────────────
    provideTranslateService({
      fallbackLang: 'en',
      loader: { provide: TranslateLoader, useClass: TranslateHttpLoader },
    }),
    provideTranslateHttpLoader({ prefix: './i18n/', suffix: '.json' }),
    {
      provide: APP_INITIALIZER,
      useFactory: (translationService: TranslationService) => () => translationService.init(),
      deps: [TranslationService],
      multi: true,
    },
  ],
};

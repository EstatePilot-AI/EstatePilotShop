import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { providePrimeNG } from 'primeng/config';

import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { provideHttpClient, withFetch } from '@angular/common/http';

const EstatePilotPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#f3e8ff',
      100: '#e9d4ff',
      200: '#d9b4fe',
      300: '#c084fc',
      400: '#ad46ff',
      500: '#9810fa',
      600: '#8200db',
      700: '#6900b3',
      800: '#55008f',
      900: '#3b006b',
    },
    colorScheme: {
      light: {
        primary: {
          color: '#8200db',
          contrastColor: '#ffffff',
          hoverColor: '#9810fa',
          activeColor: '#ad46ff',
        },
        highlight: {
          background: '#f3e8ff',
          focusBackground: '#e9d4ff',
          color: '#8200db',
          focusColor: '#9810fa',
        },
        surface: {
          0: '#ffffff',
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#cbd5e1',
          400: '#6a7282',
          500: '#4a5565',
          600: '#364153',
          700: '#364153',
          800: '#101828',
          900: '#020000',
        },
      },
      dark: {
        primary: {
          color: '#ad46ff',
          contrastColor: '#020000',
          hoverColor: '#c084fc',
          activeColor: '#e9d4ff',
        },
        highlight: {
          background: 'rgba(173, 70, 255, 0.16)',
          focusBackground: 'rgba(173, 70, 255, 0.24)',
          color: 'rgba(255,255,255,.87)',
          focusColor: 'rgba(255,255,255,.87)',
        },
        surface: {
          0: '#020000',
          50: '#101828',
          100: '#101828',
          200: '#364153',
          300: '#4a5565',
          400: '#6a7282',
          500: '#cbd5e1',
          600: '#e5e7eb',
          700: '#f3f4f6',
          800: '#f9fafb',
          900: '#ffffff',
        },
        text: {
          color: '#f3f4f6',
          hoverColor: '#f9fafb',
          mutedColor: '#6a7282',
          hoverMutedColor: '#cbd5e1',
        },
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    providePrimeNG({
      theme: {
        preset: EstatePilotPreset,
        options: {
          darkModeSelector: 'body.dark',
        },
      },
    }),
  ],
};

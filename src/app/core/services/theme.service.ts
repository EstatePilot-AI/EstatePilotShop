import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Token stored in localStorage to persist theme preference across sessions. */
const STORAGE_KEY = 'estate-pilot-theme';

/**
 * ThemeService — manages light/dark mode at runtime.
 *
 * Colour-scheme strategy
 * ─────────────────────
 * • The active theme is expressed as two CSS classes on <body>:
 *     `dark`       — primary selector used by _themes.scss and PrimeNG
 *     `dark-mode`  — backwards-compat alias for existing component SCSS that
 *                    still uses :host-context(.dark-mode) selectors.
 * • Light mode: both classes are absent.
 *
 * Persistence
 * ───────────
 * • Persisted to localStorage under the key below.
 * • Falls back to the OS prefers-color-scheme media query on first visit.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** Reactive dark-mode flag — use in templates via `themeService.isDarkMode()`. */
  readonly isDarkMode = signal(false);

  constructor() {
    if (this.isBrowser) {
      const saved = localStorage.getItem(STORAGE_KEY);
      const prefersDark =
        saved === 'dark' ||
        (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);

      this.isDarkMode.set(prefersDark);
      this.applyTheme(prefersDark);

      // Keep in sync with OS preference changes when no explicit choice is saved.
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (e) => {
          if (!localStorage.getItem(STORAGE_KEY)) {
            this.isDarkMode.set(e.matches);
          }
        });
    }

    // Reactively apply theme whenever the signal changes.
    effect(() => {
      if (this.isBrowser) {
        this.applyTheme(this.isDarkMode());
      }
    });
  }

  /** Toggle between light and dark. */
  toggleTheme(): void {
    this.isDarkMode.update((dark) => !dark);
  }

  /** Explicitly set theme. */
  setTheme(dark: boolean): void {
    this.isDarkMode.set(dark);
  }

  private applyTheme(dark: boolean): void {
    const body = document.body;

    if (dark) {
      // Primary selector — matched by _themes.scss `body.dark { ... }`
      body.classList.add('dark');
      // Backwards-compat alias — matched by existing `:host-context(.dark-mode)` in component SCSS.
      // Remove this once all components are migrated.
      body.classList.add('dark-mode');
    } else {
      body.classList.remove('dark', 'dark-mode');
    }

    localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
  }
}

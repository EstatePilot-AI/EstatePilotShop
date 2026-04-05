import { inject, Injectable, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

export type AppLanguage = 'ar' | 'en';

const STORAGE_KEY = 'estatepilot-lang';
const DEFAULT_LANG: AppLanguage = 'ar';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly translateService = inject(TranslateService);
  private readonly doc = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  /** Current active language. */
  readonly currentLang = signal<AppLanguage>(DEFAULT_LANG);

  /** Whether the current language is RTL. */
  readonly isRtl = computed(() => this.currentLang() === 'ar');

  /** Label for the language switch button (shows the OTHER language). */
  readonly switchLabel = computed(() => this.currentLang() === 'ar' ? 'English' : 'العربية');

  /** Initialize translations — call once from APP_INITIALIZER. */
  init(): void {
    this.translateService.addLangs(['ar', 'en']);

    const saved = this.getSavedLang();
    this.setLanguage(saved);
  }

  /** Switch language and update DOM direction. */
  setLanguage(lang: AppLanguage): void {
    this.currentLang.set(lang);
    this.translateService.use(lang);
    this.applyDirection(lang);
    this.saveLang(lang);
  }

  /** Toggle between Arabic and English. */
  toggleLanguage(): void {
    const next: AppLanguage = this.currentLang() === 'ar' ? 'en' : 'ar';
    this.setLanguage(next);
  }

  // ── Private ────────────────────────────────────────────────

  private applyDirection(lang: AppLanguage): void {
    const htmlEl = this.doc.documentElement;
    if (lang === 'ar') {
      htmlEl.setAttribute('dir', 'rtl');
      htmlEl.setAttribute('lang', 'ar');
    } else {
      htmlEl.setAttribute('dir', 'ltr');
      htmlEl.setAttribute('lang', 'en');
    }
  }

  private getSavedLang(): AppLanguage {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'ar' || saved === 'en') {
        return saved;
      }
    }
    return DEFAULT_LANG;
  }

  private saveLang(lang: AppLanguage): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, lang);
    }
  }
}

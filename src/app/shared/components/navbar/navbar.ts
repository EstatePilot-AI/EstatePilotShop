import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  PLATFORM_ID,
  afterNextRender,
  DestroyRef,
} from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { TranslatePipe } from '@ngx-translate/core';

import { ThemeService } from '../../../core/services/theme.service';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscapeKey()',
  },
})
export class Navbar {
  protected readonly themeService = inject(ThemeService);
  protected readonly translationService = inject(TranslationService);
  protected readonly router = inject(Router);
  private readonly doc = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  /** Whether the mobile drawer is open. */
  protected readonly mobileMenuOpen = signal(false);

  /** Aria label for the theme toggle button. */
  protected readonly themeToggleLabel = computed(() =>
    this.themeService.isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode',
  );

  /** Icon class for the theme toggle button. */
  protected readonly themeIcon = computed(() =>
    this.themeService.isDarkMode() ? 'pi pi-sun' : 'pi pi-moon',
  );

  protected readonly navLinks = [
    { labelKey: 'NAV.HOME', path: '/', icon: 'pi pi-home' },
    { labelKey: 'NAV.PROPERTIES', path: '/properties', icon: 'pi pi-building' },
    { labelKey: 'NAV.ABOUT', path: '/about', icon: 'pi pi-info-circle' },
    { labelKey: 'NAV.CONTACT', path: '/contact', icon: 'pi pi-envelope' },
  ];

  constructor() {
    // Close mobile menu on navigation.
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.closeMobileMenu());

    // Lock/unlock body scroll when drawer opens/closes.
    if (isPlatformBrowser(this.platformId)) {
      afterNextRender(() => {
        // Watch for signal changes is handled in the template reactively.
      });
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
    this.toggleBodyScroll();
  }

  closeMobileMenu(): void {
    if (this.mobileMenuOpen()) {
      this.mobileMenuOpen.set(false);
      this.toggleBodyScroll();
    }
  }

  protected onEscapeKey(): void {
    this.closeMobileMenu();
  }

  /** Checks if a link is active (exact for home, prefix for others). */
  protected isLinkActive(path: string): boolean {
    if (path === '/') {
      return this.router.url === '/';
    }
    return this.router.url.startsWith(path);
  }

  private toggleBodyScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.doc.body.style.overflow = this.mobileMenuOpen() ? 'hidden' : '';
    }
  }
}

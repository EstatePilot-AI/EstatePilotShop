import {
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Scroll-triggered reveal directive.
 *
 * Adds the CSS class `is-visible` to the host element the moment it enters
 * the viewport (via IntersectionObserver). Pair with the `.reveal-on-scroll`
 * global styles (defined in styles.scss) for fade-up animations.
 *
 * Usage:
 *   <div appReveal>…</div>
 *   <div appReveal [revealDelay]="200">…</div>   ← stagger in ms
 */
@Directive({
  selector: '[appReveal]',
  host: { class: 'reveal-on-scroll' },
})
export class RevealDirective implements OnInit, OnDestroy {
  private readonly el         = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);

  /** Optional stagger delay in milliseconds. */
  readonly revealDelay = input(0);

  private observer?: IntersectionObserver;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const el = this.el.nativeElement;
    const delay = this.revealDelay();
    if (delay) el.style.transitionDelay = `${delay}ms`;

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          this.observer?.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    this.observer.observe(el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}

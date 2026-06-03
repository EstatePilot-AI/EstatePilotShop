import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';

import { ContactPage } from './contact';

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds: readonly number[] = [];

  disconnect = vi.fn();
  observe = vi.fn();
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve = vi.fn();
}

describe('ContactPage', () => {
  let fixture: ComponentFixture<ContactPage>;

  beforeEach(async () => {
    globalThis.IntersectionObserver = MockIntersectionObserver;

    await TestBed.configureTestingModule({
      imports: [ContactPage],
      providers: [provideTranslateService({ fallbackLang: 'en' })],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation(
      'en',
      {
        CONTACT_PAGE: {
          HERO: {
            EYEBROW: 'Contact EstatePilot',
            TITLE: 'Talk to us about AI real estate outreach',
            SUBTITLE: 'Reach the EstatePilot team for business inquiries and partnerships.',
          },
          INTRO: {
            TITLE: 'How can we help?',
            BODY: 'Choose the best inquiry path and our team will follow up.',
          },
          CHANNELS: {
            BUSINESS: {
              TITLE: 'Business inquiries',
              BODY: 'Discuss AI calling packages for brokerages and agencies.',
              CTA: 'Email business team',
            },
            PARTNERSHIP: {
              TITLE: 'Partnerships',
              BODY: 'Explore collaborations with agencies, developers, and marketing firms.',
              CTA: 'Email partnerships',
            },
            SUPPORT: {
              TITLE: 'Support',
              BODY: 'Ask for product help or project information.',
              CTA: 'Email support',
            },
          },
        },
      },
      true,
    );
    translate.use('en');

    fixture = TestBed.createComponent(ContactPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('renders inquiry CTAs as mail links', () => {
    const host: HTMLElement = fixture.nativeElement;
    const links = Array.from(host.querySelectorAll<HTMLAnchorElement>('a[href^="mailto:"]'));

    expect(host.textContent).toContain('Talk to us about AI real estate outreach');
    expect(links).toHaveLength(3);
    expect(links.every((link) => link.href.includes('shop@estatepilot.com'))).toBe(true);
  });

  it('does not render a standalone contact form', () => {
    const host: HTMLElement = fixture.nativeElement;

    expect(host.querySelector('form')).toBeNull();
    expect(host.querySelector('button[type="submit"]')).toBeNull();
  });

  it('does not render page pictures', () => {
    const host: HTMLElement = fixture.nativeElement;

    expect(host.querySelector('img')).toBeNull();
  });
});

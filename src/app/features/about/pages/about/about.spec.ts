import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';

import { AboutPage } from './about';

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

describe('AboutPage', () => {
  let fixture: ComponentFixture<AboutPage>;

  const teamMembers = [
    'Youssef Mohamed Abdelrahman',
    'Hanan Hany Fathy',
    'Marslino Edward Helmy',
    'Mazen Ahmed Mahmoud',
    'Mazen Emad Fawzy',
    'Moamen Yasser Elsayed',
    'Khaled Atef Hamed',
    'Fayez Sabry Fayez',
  ];

  beforeEach(async () => {
    globalThis.IntersectionObserver = MockIntersectionObserver;

    await TestBed.configureTestingModule({
      imports: [AboutPage],
      providers: [provideRouter([]), provideTranslateService({ fallbackLang: 'en' })],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation(
      'en',
      {
        ABOUT_PAGE: {
          HERO: {
            EYEBROW: 'About EstatePilot',
            TITLE: 'AI-powered real estate outreach',
            SUBTITLE: 'EstatePilot automates high-volume outbound sales conversations.',
          },
          OVERVIEW: {
            TITLE: 'Built for real estate sales teams',
            BODY: 'EstatePilot is an AI conversational agent for sales managers and agents.',
          },
          BUSINESS: {
            TITLE: 'Business model',
            ITEMS: ['B2B SaaS subscriptions', 'Agency partnerships'],
          },
          SYSTEM: {
            TITLE: 'System description',
            ITEMS: ['Outbound campaign automation', 'Lead qualification'],
          },
          TEAM: {
            TITLE: 'Project Team',
          },
        },
      },
      true,
    );
    translate.use('en');

    fixture = TestBed.createComponent(AboutPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('renders the translated About heading and product positioning', () => {
    const host: HTMLElement = fixture.nativeElement;

    expect(host.textContent).toContain('AI-powered real estate outreach');
    expect(host.textContent).toContain('Built for real estate sales teams');
    expect(host.textContent).toContain('Business model');
    expect(host.textContent).toContain('System description');
  });

  it('renders all project team members from the supplied image', () => {
    const host: HTMLElement = fixture.nativeElement;

    for (const member of teamMembers) {
      expect(host.textContent).toContain(member);
    }
  });

  it('does not render page pictures', () => {
    const host: HTMLElement = fixture.nativeElement;

    expect(host.querySelector('img')).toBeNull();
  });
});

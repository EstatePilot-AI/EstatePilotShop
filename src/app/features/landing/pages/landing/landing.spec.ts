import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { PropertyService } from '../../../../core/services/property.service';
import { IPaginatedResponse, IProperty } from '../../../property/models/IProperty';
import { Landing } from './landing';

class TestIntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds = [];
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

function property(): IProperty {
  return {
    propertyId: 7,
    price: 10_000_000,
    area: 220,
    propertyType: 'villa',
    status: 'Available',
    city: 'Egypt',
    district: 'حي الزيتون',
    createdAt: '2026-05-05T00:00:00Z',
    imageURLs: ['villa.jpg'],
  };
}

function response(data: IProperty[]): IPaginatedResponse<IProperty> {
  return {
    data,
    totalCount: data.length,
    pageNumber: 1,
    pageSize: 4,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };
}

describe('Landing', () => {
  let fixture: ComponentFixture<Landing>;
  let propertyService: {
    getAllProperties: ReturnType<typeof vi.fn>;
    buildPropertyImageUrl: ReturnType<typeof vi.fn>;
  };

  async function createComponent(): Promise<void> {
    globalThis.IntersectionObserver = TestIntersectionObserver as typeof IntersectionObserver;
    propertyService = {
      getAllProperties: vi.fn(() => of(response([property()]))),
      buildPropertyImageUrl: vi.fn((fileName: string) => `/Images/${fileName}`),
    };

    await TestBed.configureTestingModule({
      imports: [Landing],
      providers: [
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
        { provide: PropertyService, useValue: propertyService },
      ],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation(
      'en',
      {
        LISTINGS: {
          CARD_DESCRIPTION: 'Discover this {{type}} in {{location}}',
          PROPERTY_DETAILS_SUMMARY: 'Property details summary',
          SAVE_PROPERTY_ARIA: 'Save {{type}} in {{location}}',
          VIEW_DETAILS: 'View Details',
          VIEW_DETAILS_ARIA: 'View details for property {{id}}',
        },
        PROPERTY_LABELS: {
          TYPES: {
            VILLA: 'Villa',
          },
          STATUS: {
            AVAILABLE: 'Translated Available',
          },
        },
      },
      true,
    );
    translate.use('en');

    fixture = TestBed.createComponent(Landing);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders featured listings with the Nawy-style card and translated actions', async () => {
    await createComponent();

    const host: HTMLElement = fixture.nativeElement;
    const card = host.querySelector<HTMLElement>('.featured-property-card');
    const detailsLink = host.querySelector<HTMLAnchorElement>('.featured-property-card__link');
    const favoriteButton = host.querySelector<HTMLButtonElement>('.featured-property-card__favorite');
    const details = host.querySelector<HTMLElement>('.featured-property-card__details');

    expect(card).not.toBeNull();
    expect(detailsLink?.getAttribute('href')).toBe('/properties/7');
    expect(detailsLink?.getAttribute('aria-label')).toBe('View details for property 7');
    expect(favoriteButton).toBeNull();
    expect(host.textContent).toContain('حي الزيتون - Egypt');
    expect(host.textContent).toContain('Discover this Villa in حي الزيتون, Egypt');
    expect(host.textContent).toContain('10,000,000');
    expect(host.textContent).toContain('220 m²');
    expect(host.textContent).toContain('Translated Available');
    expect(details?.textContent).not.toContain('Available');
    expect(details?.textContent).not.toContain('Translated Available');
  });
});

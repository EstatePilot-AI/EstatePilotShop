import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { PropertyService } from '../../../../core/services/property.service';
import { IPaginatedResponse, IProperty } from '../../models/IProperty';
import { PropertyList } from './property-list';

function property(): IProperty {
  return {
    propertyId: 42,
    price: 22_000_000,
    area: 180,
    propertyType: 'duplex',
    status: 'Available',
    city: 'New Zayed',
    district: 'Jirian',
    createdAt: '2026-05-01T00:00:00Z',
    imageURLs: ['jirian.jpg'],
  };
}

function arabicProperty(): IProperty {
  return {
    ...property(),
    propertyId: 43,
    propertyType: 'دوبلكس',
    status: 'متاح',
    city: 'مصر',
    district: 'مدينة الشروق',
  };
}

function response(data: IProperty[]): IPaginatedResponse<IProperty> {
  return {
    data,
    totalCount: data.length,
    pageNumber: 1,
    pageSize: 9,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };
}

describe('PropertyList', () => {
  let fixture: ComponentFixture<PropertyList>;
  let propertyService: {
    getAllProperties: ReturnType<typeof vi.fn>;
    buildPropertyImageUrl: ReturnType<typeof vi.fn>;
  };

  async function createComponent(): Promise<void> {
    propertyService = {
      getAllProperties: vi.fn(() => of(response([property()]))),
      buildPropertyImageUrl: vi.fn((fileName: string) => `/Images/${fileName}`),
    };

    await TestBed.configureTestingModule({
      imports: [PropertyList],
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
        PROPERTIES: {
          SAVE_PROPERTY_ARIA: 'Save {{type}} in {{location}}',
          VIEW_DETAILS_ARIA: 'View details for property {{id}}',
          PROPERTY_DETAILS_SUMMARY: 'Property details summary',
          CARD_DESCRIPTION: 'Discover this {{type}} in {{location}}',
        },
        PROPERTY_LABELS: {
          TYPES: {
            DUPLEX: 'Translated Duplex',
          },
          STATUS: {
            AVAILABLE: 'Translated Available',
          },
          LOCATIONS: {
            EGYPT: 'Egypt',
            EL_SHOROUK: 'El Shorouk',
          },
        },
      },
      true,
    );
    translate.use('en');

    fixture = TestBed.createComponent(PropertyList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  async function createComponentWithArabicData(): Promise<void> {
    propertyService = {
      getAllProperties: vi.fn(() => of(response([arabicProperty()]))),
      buildPropertyImageUrl: vi.fn((fileName: string) => `/Images/${fileName}`),
    };

    await TestBed.configureTestingModule({
      imports: [PropertyList],
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
        PROPERTIES: {
          SAVE_PROPERTY_ARIA: 'Save {{type}} in {{location}}',
          VIEW_DETAILS_ARIA: 'View details for property {{id}}',
          PROPERTY_DETAILS_SUMMARY: 'Property details summary',
          CARD_DESCRIPTION: 'Discover this {{type}} in {{location}}',
        },
        PROPERTY_LABELS: {
          TYPES: {
            DUPLEX: 'Translated Duplex',
          },
          STATUS: {
            AVAILABLE: 'Translated Available',
          },
          LOCATIONS: {
            EGYPT: 'Egypt',
            EL_SHOROUK: 'El Shorouk',
          },
        },
      },
      true,
    );
    translate.use('en');

    fixture = TestBed.createComponent(PropertyList);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders a Nawy-inspired horizontal listing card with real navigation and square-meter area', async () => {
    await createComponent();

    const host: HTMLElement = fixture.nativeElement;
    const card = host.querySelector<HTMLElement>('.property-list-card');
    const detailsLink = host.querySelector<HTMLAnchorElement>('.property-list-card__link');
    const favoriteButton = host.querySelector<HTMLButtonElement>('.property-list-card__favorite');

    expect(card).not.toBeNull();
    expect(detailsLink?.getAttribute('href')).toBe('/properties/42');
    expect(favoriteButton).toBeNull();
    const details = host.querySelector<HTMLElement>('.property-list-card__details');

    expect(detailsLink?.contains(favoriteButton)).toBe(false);
    expect(host.textContent).toContain('Jirian - New Zayed');
    expect(host.textContent).toContain('Discover this Translated Duplex in Jirian, New Zayed');
    expect(host.textContent).toContain('Translated Available');
    expect(host.textContent).toContain('22,000,000');
    expect(host.textContent).toContain('180 m²');
    expect(details?.textContent).not.toContain('Available');
    expect(details?.textContent).not.toContain('Translated Available');
  });

  it('translates Arabic backend values when the current language is English', async () => {
    await createComponentWithArabicData();

    const host: HTMLElement = fixture.nativeElement;
    const status = host.querySelector<HTMLElement>('.property-list-card__status');

    expect(host.textContent).toContain('El Shorouk - Egypt');
    expect(host.textContent).toContain('Discover this Translated Duplex in El Shorouk, Egypt');
    expect(host.textContent).toContain('Translated Available');
    expect(host.textContent).not.toContain('مدينة الشروق');
    expect(host.textContent).not.toContain('مصر');
    expect(host.textContent).not.toContain('متاح');
    expect(status?.classList.contains('status-available')).toBe(true);
  });

  it('uses local fallback images when a property image fails to load', async () => {
    await createComponent();

    const host: HTMLElement = fixture.nativeElement;
    const image = host.querySelector<HTMLImageElement>('.property-list-card__image');
    expect(image?.src).toContain('/Images/jirian.jpg');

    componentFromFixture(fixture).onImageError({ target: image } as unknown as Event, {
      ...property(),
      propertyType: 'villa',
    });

    expect(image?.src).toContain('/images/properties/modern-villa.png');
  });
});

function componentFromFixture(fixture: ComponentFixture<PropertyList>): PropertyList {
  return fixture.componentInstance;
}

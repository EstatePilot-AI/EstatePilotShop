import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap, provideRouter } from '@angular/router';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { BehaviorSubject, of } from 'rxjs';
import { PropertyService } from '../../../../core/services/property.service';
import { IPropertyDetail } from '../../models/IProperty';
import { PropertyDetails } from './property-details';

function property(id: number): IPropertyDetail {
  return {
    propertyId: id,
    price: id * 1_000_000,
    area: 120 + id,
    propertyType: 'apartment',
    status: 'available',
    propertyStatus: 'available',
    city: `City ${id}`,
    district: `District ${id}`,
    createdAt: '2026-01-01T00:00:00Z',
    finishingType: 'finished',
    rooms: 3,
    bathrooms: 2,
    country: 'Egypt',
    governorate: 'Giza',
    street: 'Main Street',
    buildingNumber: 10,
    floorNumber: 4,
    apartmentNumber: 12,
    imageURLs: [],
  };
}

describe('PropertyDetails', () => {
  let fixture: ComponentFixture<PropertyDetails>;
  let component: PropertyDetails;
  let paramMap$: BehaviorSubject<ParamMap>;
  let propertyService: { getPropertyById: ReturnType<typeof vi.fn>; buildPropertyImageUrl: ReturnType<typeof vi.fn> };

  async function createComponent(initialId = '1'): Promise<void> {
    paramMap$ = new BehaviorSubject(convertToParamMap({ id: initialId }));
    propertyService = {
      getPropertyById: vi.fn((id: number) => of(property(id))),
      buildPropertyImageUrl: vi.fn((fileName: string) => `/Images/${fileName}`),
    };

    await TestBed.configureTestingModule({
      imports: [PropertyDetails],
      providers: [
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
        MessageService,
        { provide: PropertyService, useValue: propertyService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: paramMap$.asObservable(),
            snapshot: { paramMap: convertToParamMap({ id: initialId }) },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('loads the initial valid route id', async () => {
    await createComponent('1');

    expect(propertyService.getPropertyById).toHaveBeenCalledWith(1);
    expect(component.property()?.propertyId).toBe(1);
    expect(component.loading()).toBe(false);
  });

  it('reloads property data when the route id changes in the same component instance', async () => {
    await createComponent('1');

    paramMap$.next(convertToParamMap({ id: '2' }));
    fixture.detectChanges();

    expect(propertyService.getPropertyById).toHaveBeenLastCalledWith(2);
    expect(component.property()?.propertyId).toBe(2);
    expect(component.selectedImageIndex()).toBe(0);
  });

  it('shows an invalid-id error and does not call the API for an invalid route id', async () => {
    await createComponent('1');
    propertyService.getPropertyById.mockClear();

    paramMap$.next(convertToParamMap({ id: 'bad' }));
    fixture.detectChanges();

    expect(propertyService.getPropertyById).not.toHaveBeenCalled();
    expect(component.property()).toBeNull();
    expect(component.loading()).toBe(false);
    expect(component.error()).toBe(TestBed.inject(TranslateService).instant('PROPERTY_DETAILS.INVALID_ID'));
  });

  it('reloads the latest active route id', async () => {
    await createComponent('1');
    paramMap$.next(convertToParamMap({ id: '2' }));
    fixture.detectChanges();
    propertyService.getPropertyById.mockClear();

    component.reload();

    expect(propertyService.getPropertyById).toHaveBeenCalledWith(2);
    expect(component.property()?.propertyId).toBe(2);
  });
});

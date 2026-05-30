import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { PropertyChatCard } from './property-chat-card';

describe('PropertyChatCard', () => {
  let fixture: ComponentFixture<PropertyChatCard>;
  let component: PropertyChatCard;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertyChatCard],
      providers: [provideRouter([]), provideTranslateService({ fallbackLang: 'en' })],
    }).compileComponents();

    fixture = TestBed.createComponent(PropertyChatCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('property', {
      property_id: '77',
      propertyType: 'LUXURY apartment',
      price: 0,
      area: 120,
      rooms: 3,
      bathrooms: 2,
      floorNumber: 4,
      district: 'Zamalek',
      city: 'Cairo',
    });
    fixture.detectChanges();
  });

  it('builds display fields from normalized property data', () => {
    expect(component.resolvedPropertyId()).toBe(77);
    expect(component.propertyLink()).toEqual(['/properties', 77]);
    expect(component.displayType()).toBe('Luxury Apartment');
    expect(component.formattedPrice()).toContain('EGP');
    expect(component.displayLocation()).toBe('Zamalek, Cairo');
  });

  it('builds a DRY meta item view model for the template', () => {
    expect(component.metaItems()).toEqual([
      expect.objectContaining({ value: '120', labelKey: 'CHATBOT.AREA' }),
      expect.objectContaining({ value: '3', labelKey: 'CHATBOT.ROOMS' }),
      expect.objectContaining({ value: '2', labelKey: 'CHATBOT.BATHROOMS' }),
      expect.objectContaining({ value: '4', labelKey: 'CHATBOT.FLOOR' }),
    ]);
  });

  it('renders a text-first compact card without an image placeholder column', () => {
    expect(fixture.nativeElement.querySelector('.chat-card__image')).toBeNull();
    expect(fixture.nativeElement.querySelector('.chat-card__body')).not.toBeNull();
  });
});

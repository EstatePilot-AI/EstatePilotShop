import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { EMPTY, Observable } from 'rxjs';
import { catchError, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';

import { PropertyService } from '../../../../core/services/property.service';
import { IPropertyDetail } from '../../models/IProperty';
import { ContactDialog } from '../../../contact/components/contact-dialog/contact-dialog';
import {
  displayTranslatedFinishingType,
  displayTranslatedPropertyLocation,
  displayTranslatedPropertyStatus,
  displayTranslatedPropertyType,
  propertyStatusKey as getPropertyStatusKey,
} from '../../utils/property-labels';

@Component({
  selector: 'app-property-details',
  imports: [
    RouterLink,
    ButtonModule,
    TagModule,
    SkeletonModule,
    DividerModule,
    MessageModule,
    ContactDialog,
    TranslatePipe,
  ],
  templateUrl: './property-details.html',
  styleUrl: './property-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly propertyService = inject(PropertyService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  readonly property = signal<IPropertyDetail | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly selectedImageIndex = signal(0);
  private readonly activePropertyId = signal<number | null>(null);

  // ── Contact Dialog ──────────────────────────────────────
  readonly dialogVisible = signal(false);

  openContactDialog(): void {
    this.dialogVisible.set(true);
  }

  onGalleryImageError(event: Event, propertyType: string): void {
    const image = event.target as HTMLImageElement | null;
    if (!image) return;

    if (image.dataset['fallbackApplied'] === 'true') return;
    image.dataset['fallbackApplied'] = 'true';
    image.src = this.localFallbackImage(propertyType);
  }

  selectGalleryImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  displayPropertyType(propertyType: string): string {
    return displayTranslatedPropertyType(this.translate, propertyType);
  }

  displayPropertyStatus(status: string): string {
    return displayTranslatedPropertyStatus(this.translate, status);
  }

  displayFinishingType(finishingType: string): string {
    return displayTranslatedFinishingType(this.translate, finishingType);
  }

  displayPropertyLocation(location: string): string {
    return displayTranslatedPropertyLocation(this.translate, location);
  }

  propertyStatusKey(status: string): string {
    return getPropertyStatusKey(status);
  }

  formatFloorLabel(floorNumber: number): string {
    if (floorNumber === 0) return 'Ground Floor';
    if (floorNumber < 0) return `Basement ${Math.abs(floorNumber)}`;

    const modulo10 = floorNumber % 10;
    const modulo100 = floorNumber % 100;
    const suffix =
      modulo10 === 1 && modulo100 !== 11
        ? 'st'
        : modulo10 === 2 && modulo100 !== 12
          ? 'nd'
          : modulo10 === 3 && modulo100 !== 13
            ? 'rd'
            : 'th';

    return `${floorNumber}${suffix} Floor`;
  }

  readonly formattedPrice = computed(() => {
    const p = this.property();
    if (!p) return '';
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(p.price);
  });

  readonly fullAddress = computed(() => {
    const p = this.property();
    if (!p) return '';
    return [
      p.street,
      p.district,
      p.city,
      p.governorate,
      p.country,
    ]
      .filter(Boolean)
      .map((location) => this.displayPropertyLocation(location))
      .join(', ');
  });

  readonly galleryImages = computed(() => {
    const p = this.property();
    if (!p) return [];

    const imageUrls = (p.imageURLs ?? [])
      .filter((fileName): fileName is string => Boolean(fileName))
      .map(fileName => this.propertyService.buildPropertyImageUrl(fileName));

    if (imageUrls.length > 0) {
      return imageUrls;
    }

    return [this.localFallbackImage(p.propertyType)];
  });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => this.parseRouteId(params.get('id'))),
        distinctUntilChanged(),
        switchMap((id) => {
          if (id === null) {
            this.setInvalidIdState();
            return EMPTY;
          }

          return this.loadProperty(id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => this.setLoadedProperty(data));
  }

  statusSeverity(
    status: string,
  ): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' {
    const map: Record<
      string,
      'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast'
    > = {
      AVAILABLE: 'success',
      SOLD: 'danger',
      RENTED: 'warn',
      PENDING: 'info',
    };
    return map[this.propertyStatusKey(status)] ?? 'secondary';
  }

  reload(): void {
    const id = this.activePropertyId();

    if (id === null) {
      this.setInvalidIdState();
      return;
    }

    this.loadProperty(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => this.setLoadedProperty(data));
  }

  private parseRouteId(rawId: string | null): number | null {
    const id = Number(rawId);
    if (!Number.isFinite(id) || id <= 0) return null;
    return Math.trunc(id);
  }

  private loadProperty(id: number): Observable<IPropertyDetail> {
    this.activePropertyId.set(id);
    this.property.set(null);
    this.loading.set(true);
    this.error.set(null);
    this.selectedImageIndex.set(0);

    return this.propertyService.getPropertyById(id).pipe(
      catchError((err: Error) => {
        this.property.set(null);
        this.error.set(
          err?.message ?? this.translate.instant('PROPERTY_DETAILS.LOAD_ERROR'),
        );
        this.loading.set(false);
        return EMPTY;
      }),
    );
  }

  private setLoadedProperty(data: IPropertyDetail): void {
    this.property.set(data);
    this.selectedImageIndex.set(0);
    this.loading.set(false);
  }

  private setInvalidIdState(): void {
    this.activePropertyId.set(null);
    this.property.set(null);
    this.error.set(this.translate.instant('PROPERTY_DETAILS.INVALID_ID'));
    this.loading.set(false);
  }

  private localFallbackImage(propertyType: string): string {
    const type = propertyType?.toLowerCase().trim();
    const map: Record<string, string> = {
      apartment: '/images/properties/luxury-apartment.png',
      villa: '/images/properties/modern-villa.png',
      penthouse: '/images/properties/penthouse.png',
      house: '/images/properties/beach-house.png',
      chalet: '/images/properties/beach-house.png',
    };

    return map[type] ?? '/images/properties/luxury-apartment.png';
  }
}

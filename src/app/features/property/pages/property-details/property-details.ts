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

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';

import { PropertyService } from '../../../../core/services/property.service';
import { IPropertyDetail } from '../../models/IProperty';
import { ContactDialog } from '../../../contact/components/contact-dialog/contact-dialog';

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

  // ── Contact Dialog ──────────────────────────────────────
  readonly dialogVisible = signal(false);

  openContactDialog(): void {
    this.dialogVisible.set(true);
  }

  propertyImageUrl(propertyType: string): string {
    const type = propertyType?.toLowerCase().trim();
    const imageByType: Record<string, string> = {
      apartment: '/images/properties/luxury-apartment.png',
      villa: '/images/properties/modern-villa.png',
      penthouse: '/images/properties/penthouse.png',
      house: '/images/properties/beach-house.png',
      chalet: '/images/properties/beach-house.png',
      office:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80',
      land:
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80',
    };

    return imageByType[type] ?? this.localFallbackImage(propertyType);
  }

  onHeroImageError(event: Event, propertyType: string): void {
    const image = event.target as HTMLImageElement | null;
    if (!image) return;

    if (image.dataset['fallbackApplied'] === 'true') return;
    image.dataset['fallbackApplied'] = 'true';
    image.src = this.localFallbackImage(propertyType);
  }

  displayPropertyType(propertyType: string): string {
    if (!propertyType) return 'Property';
    return propertyType
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
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
      .join(', ');
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id || isNaN(id)) {
      this.error.set(this.translate.instant('PROPERTY_DETAILS.INVALID_ID'));
      this.loading.set(false);
      return;
    }
    this.loadProperty(id);
  }

  statusSeverity(
    status: string,
  ): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' {
    const map: Record<
      string,
      'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast'
    > = {
      متاحة: 'success',
      available: 'success',
      sold: 'danger',
      مباعة: 'danger',
      rented: 'warn',
      مؤجرة: 'warn',
      pending: 'info',
      معلقة: 'info',
    };
    return map[status?.toLowerCase()] ?? 'secondary';
  }

  reload(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loading.set(true);
    this.error.set(null);
    this.loadProperty(id);
  }

  private loadProperty(id: number): void {
    this.propertyService
      .getPropertyById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.property.set(data);
          this.loading.set(false);
        },
        error: (err: Error) => {
          this.error.set(
            err?.message ?? this.translate.instant('PROPERTY_DETAILS.LOAD_ERROR'),
          );
          this.loading.set(false);
        },
      });
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

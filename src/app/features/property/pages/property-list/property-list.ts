import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';

import { PropertyService } from '../../../../core/services/property.service';
import { IProperty } from '../../models/IProperty';

@Component({
  selector: 'app-property-list',
  imports: [
    RouterLink,
    FormsModule,
    ButtonModule,
    CardModule,
    TagModule,
    SkeletonModule,
    InputTextModule,
    SelectModule,
    MessageModule,
    TooltipModule,
    DividerModule,
    TranslatePipe,
  ],
  templateUrl: './property-list.html',
  styleUrl: './property-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyList implements OnInit {
  private readonly propertyService = inject(PropertyService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  // ── State ───────────────────────────────────────────────
  readonly properties = signal<IProperty[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly searchQuery = signal('');
  readonly selectedType = signal<string | null>(null);
  readonly sortBy = signal('newest');

  // ── Dropdown options (translated reactively) ───────────
  readonly propertyTypes = computed(() => [
    { label: this.translate.instant('PROPERTIES.ALL_TYPES'), value: null },
    { label: this.translate.instant('PROPERTIES.APARTMENT'), value: 'apartment' },
    { label: this.translate.instant('PROPERTIES.VILLA'), value: 'villa' },
    { label: this.translate.instant('PROPERTIES.OFFICE'), value: 'office' },
    { label: this.translate.instant('PROPERTIES.LAND'), value: 'land' },
  ]);

  readonly sortOptions = computed(() => [
    { label: this.translate.instant('PROPERTIES.NEWEST'), value: 'newest' },
    { label: this.translate.instant('PROPERTIES.PRICE_LOW_HIGH'), value: 'price_asc' },
    { label: this.translate.instant('PROPERTIES.PRICE_HIGH_LOW'), value: 'price_desc' },
    { label: this.translate.instant('PROPERTIES.AREA_LARGE_SMALL'), value: 'area_desc' },
  ]);

  // ── Derived list (filter + sort, no HTTP) ───────────────
  readonly filtered = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const type = this.selectedType();
    const sort = this.sortBy();

    let list = this.properties().filter(p => {
      const matchesSearch =
        !q ||
        p.city.toLowerCase().includes(q) ||
        p.district.toLowerCase().includes(q) ||
        p.propertyType.toLowerCase().includes(q);
      const matchesType = !type || p.propertyType.toLowerCase() === type;
      return matchesSearch && matchesType;
    });

    switch (sort) {
      case 'price_asc': list = [...list].sort((a, b) => a.price - b.price); break;
      case 'price_desc': list = [...list].sort((a, b) => b.price - a.price); break;
      case 'area_desc': list = [...list].sort((a, b) => b.area - a.area); break;
    }
    return list;
  });

  readonly skeletonItems = Array.from({ length: 6 });

  // ── Lifecycle ───────────────────────────────────────────
  ngOnInit(): void {
    this.loadProperties();
  }

  // ── Public helpers ──────────────────────────────────────
  propertyImageUrl(property: IProperty): string {
    const type = property.propertyType?.toLowerCase().trim();
    const imageByType: Record<string, string> = {
      apartment: '/images/properties/luxury-apartment.png',
      villa: '/images/properties/modern-villa.png',
      penthouse: '/images/properties/penthouse.png',
      house: '/images/properties/beach-house.png',
      chalet: '/images/properties/beach-house.png',
      office:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      land:
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    };

    return imageByType[type] ?? this.localFallbackImage(property.propertyType);
  }

  onImageError(event: Event, property: IProperty): void {
    const image = event.target as HTMLImageElement | null;
    if (!image) return;

    if (image.dataset['fallbackApplied'] === 'true') return;
    image.dataset['fallbackApplied'] = 'true';
    image.src = this.localFallbackImage(property.propertyType);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(price);
  }

  displayPropertyType(propertyType: string): string {
    if (!propertyType) return 'Property';
    return propertyType
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  statusSeverity(
    status: string,
  ): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' {
    const map: Record<
      string,
      'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast'
    > = {
      available: 'success',
      sold: 'danger',
      rented: 'warn',
      pending: 'info',
    };
    return map[status?.toLowerCase()] ?? 'secondary';
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedType.set(null);
    this.sortBy.set('newest');
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(null);
    this.loadProperties();
  }

  // ── Private ─────────────────────────────────────────────
  private loadProperties(): void {
    this.propertyService
      .getAllProperties()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.properties.set(data);
          this.loading.set(false);
        },
        error: (err: Error) => {
          this.error.set(err?.message ?? 'Failed to load properties. Please try again.');
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

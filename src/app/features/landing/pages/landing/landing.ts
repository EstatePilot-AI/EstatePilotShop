import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { CarouselModule } from 'primeng/carousel';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { PropertyService } from '../../../../core/services/property.service';
import { IProperty } from '../../../property/models/IProperty';
import { RevealDirective } from '../../../../shared/directives/reveal.directive';

interface Category {
  icon: string;
  nameKey: string;
  count: number;
}

interface Stat {
  value: string;
  labelKey: string;
  icon: string;
}

interface HeroSlide {
  image: string;
  labelKey: string;
}

@Component({
  selector: 'app-landing',
  imports: [
    RouterLink,
    ButtonModule,
    TagModule,
    SkeletonModule,
    DividerModule,
    TooltipModule,
    MessageModule,
    CarouselModule,
    RevealDirective,
    TranslatePipe,
  ],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Landing implements OnInit {
  private readonly propertyService = inject(PropertyService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly translate = inject(TranslateService);

  // ── Featured listings state ─────────────────────────────
  readonly featuredProperties = signal<IProperty[]>([]);
  readonly featuredLoading = signal(true);
  readonly featuredError = signal<string | null>(null);
  readonly featuredPreview = signal<IProperty[]>([]);
  readonly skeletonItems = Array.from({ length: 3 });

  // ── Hero Carousel ─────────────────────────────────────────
  readonly heroSlides: HeroSlide[] = [
    { image: 'images/properties/luxury-apartment.png', labelKey: 'HERO.SLIDE_APARTMENT' },
    { image: 'images/properties/modern-villa.png', labelKey: 'HERO.SLIDE_VILLA' },
    { image: 'images/properties/penthouse.png', labelKey: 'HERO.SLIDE_PENTHOUSE' },
    { image: 'images/properties/beach-house.png', labelKey: 'HERO.SLIDE_BEACH' },
  ];

  // ── Lifecycle ────────────────────────────────────────────
  ngOnInit(): void {
    this.propertyService
      .getAllProperties()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.featuredProperties.set(data);
          this.featuredPreview.set(data.slice(0, 3));
          this.featuredLoading.set(false);
        },
        error: (err: Error) => {
          this.featuredError.set(err?.message ?? 'Failed to load properties.');
          this.featuredLoading.set(false);
        },
      });
  }

  // ── Helpers ──────────────────────────────────────────────
  displayPropertyType(propertyType: string): string {
    if (!propertyType) return 'Property';
    return propertyType
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  propertyImageUrl(property: IProperty): string {
    const firstImageFileName = property.imageURLs?.find(Boolean);
    if (firstImageFileName) {
      return this.propertyService.buildPropertyImageUrl(firstImageFileName);
    }

    return this.localFallbackImage(property.propertyType);
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

  statusSeverity(
    status: string,
  ): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' {
    const map: Record<string, 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast'> = {
      available: 'success',
      sold: 'danger',
      rented: 'warn',
      pending: 'info',
    };
    return map[status?.toLowerCase()] ?? 'secondary';
  }

  protected readonly categories: Category[] = [
    { icon: 'pi pi-building', nameKey: 'CATEGORIES.APARTMENTS', count: 840 },
    { icon: 'pi pi-home', nameKey: 'CATEGORIES.VILLAS', count: 320 },
    { icon: 'pi pi-warehouse', nameKey: 'CATEGORIES.COMMERCIAL', count: 150 },
    { icon: 'pi pi-map', nameKey: 'CATEGORIES.LAND', count: 95 },
    { icon: 'pi pi-briefcase', nameKey: 'CATEGORIES.OFFICES', count: 210 },
    { icon: 'pi pi-key', nameKey: 'CATEGORIES.RENTALS', count: 560 },
  ];

  protected readonly stats: Stat[] = [
    { value: '2,500+', labelKey: 'STATS.PROPERTIES_LISTED', icon: 'pi pi-building' },
    { value: '1,200+', labelKey: 'STATS.HAPPY_BUYERS', icon: 'pi pi-users' },
    { value: '$2.5B', labelKey: 'STATS.TOTAL_SALES', icon: 'pi pi-dollar' },
    { value: '15+', labelKey: 'STATS.YEARS_IN_MARKET', icon: 'pi pi-calendar' },
  ];

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


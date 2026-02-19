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

const PROPERTY_TYPES = [
  { label: 'All Types',  value: null },
  { label: 'Apartment',  value: 'apartment' },
  { label: 'Villa',      value: 'villa' },
  { label: 'Office',     value: 'office' },
  { label: 'Land',       value: 'land' },
];

const SORT_OPTIONS = [
  { label: 'Newest',              value: 'newest' },
  { label: 'Price: Low → High',   value: 'price_asc' },
  { label: 'Price: High → Low',   value: 'price_desc' },
  { label: 'Area: Large → Small', value: 'area_desc' },
];

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
  ],
  templateUrl: './property-list.html',
  styleUrl: './property-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyList implements OnInit {
  private readonly propertyService = inject(PropertyService);
  private readonly destroyRef       = inject(DestroyRef);

  // ── State ───────────────────────────────────────────────
  readonly properties   = signal<IProperty[]>([]);
  readonly loading      = signal(true);
  readonly error        = signal<string | null>(null);
  readonly searchQuery  = signal('');
  readonly selectedType = signal<string | null>(null);
  readonly sortBy       = signal('newest');

  // ── Dropdown options ────────────────────────────────────
  readonly propertyTypes = PROPERTY_TYPES;
  readonly sortOptions   = SORT_OPTIONS;

  // ── Derived list (filter + sort, no HTTP) ───────────────
  readonly filtered = computed(() => {
    const q    = this.searchQuery().toLowerCase().trim();
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
      case 'price_asc':  list = [...list].sort((a, b) => a.price - b.price); break;
      case 'price_desc': list = [...list].sort((a, b) => b.price - a.price); break;
      case 'area_desc':  list = [...list].sort((a, b) => b.area  - a.area);  break;
    }
    return list;
  });

  readonly skeletonItems = Array.from({ length: 6 });

  // ── Lifecycle ───────────────────────────────────────────
  ngOnInit(): void {
    this.loadProperties();
  }

  // ── Public helpers ──────────────────────────────────────
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
    const map: Record<
      string,
      'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast'
    > = {
      available: 'success',
      sold:      'danger',
      rented:    'warn',
      pending:   'info',
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
}

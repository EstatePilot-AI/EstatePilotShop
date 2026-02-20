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

import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';

import { PropertyService } from '../../../../core/services/property.service';
import { IPropertyDetail } from '../../models/IProperty';

@Component({
  selector: 'app-property-details',
  imports: [
    RouterLink,
    ButtonModule,
    TagModule,
    SkeletonModule,
    DividerModule,
    MessageModule,
  ],
  templateUrl: './property-details.html',
  styleUrl: './property-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly propertyService = inject(PropertyService);
  private readonly destroyRef = inject(DestroyRef);

  readonly property = signal<IPropertyDetail | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

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
      this.error.set('Invalid property ID.');
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
            err?.message ?? 'Failed to load property details. Please try again.',
          );
          this.loading.set(false);
        },
      });
  }
}

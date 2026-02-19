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

import { PropertyService } from '../../../../core/services/property.service';
import { IProperty } from '../../../property/models/IProperty';

interface Category {
  icon: string;
  name: string;
  count: number;
}

interface Stat {
  value: string;
  label: string;
  icon: string;
}

interface Testimonial {
  name: string;
  role: string;
  text: string;
  avatar: string;
  rating: number;
}

@Component({
  selector: 'app-landing',
  imports: [RouterLink, ButtonModule, TagModule, SkeletonModule, DividerModule, TooltipModule, MessageModule],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Landing implements OnInit {
  private readonly propertyService = inject(PropertyService);
  private readonly destroyRef = inject(DestroyRef);

  // ── Featured listings state ─────────────────────────────
  readonly featuredProperties = signal<IProperty[]>([]);
  readonly featuredLoading = signal(true);
  readonly featuredError = signal<string | null>(null);
  readonly featuredPreview = signal<IProperty[]>([]);
  readonly skeletonItems = Array.from({ length: 3 });

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
      sold:      'danger',
      rented:    'warn',
      pending:   'info',
    };
    return map[status?.toLowerCase()] ?? 'secondary';
  }

  protected readonly categories: Category[] = [
    { icon: 'pi pi-building', name: 'Apartments', count: 840 },
    { icon: 'pi pi-home', name: 'Villas', count: 320 },
    { icon: 'pi pi-warehouse', name: 'Commercial', count: 150 },
    { icon: 'pi pi-map', name: 'Land', count: 95 },
    { icon: 'pi pi-briefcase', name: 'Offices', count: 210 },
    { icon: 'pi pi-key', name: 'Rentals', count: 560 },
  ];

  protected readonly stats: Stat[] = [
    { value: '2,500+', label: 'Properties Listed', icon: 'pi pi-building' },
    { value: '1,200+', label: 'Happy Buyers', icon: 'pi pi-users' },
    { value: '$2.5B', label: 'Total Sales', icon: 'pi pi-dollar' },
    { value: '15+', label: 'Years in Market', icon: 'pi pi-calendar' },
  ];

  protected readonly testimonials: Testimonial[] = [
    {
      name: 'Sarah Johnson',
      role: 'Homeowner',
      text: 'EstatePilot made buying our dream home a breeze. The platform is intuitive and the listings are top-notch quality.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Property Investor',
      text: 'As an investor, I appreciate the detailed analytics and market insights. Best real estate platform I have used.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'First-time Buyer',
      text: 'The search filters are amazing. Found exactly what I was looking for within my budget in just two weeks!',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
      rating: 5,
    },
  ];

  protected getStars(count: number): number[] {
    return Array.from({ length: count }, (_, i) => i);
  }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

interface Property {
  image: string;
  title: string;
  location: string;
  price: string;
  type: string;
  beds: number;
  baths: number;
  sqft: string;
  isNew: boolean;
}

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
  imports: [RouterLink, ButtonModule, TagModule],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Landing {
  protected readonly categories: Category[] = [
    { icon: 'pi pi-building', name: 'Apartments', count: 840 },
    { icon: 'pi pi-home', name: 'Villas', count: 320 },
    { icon: 'pi pi-warehouse', name: 'Commercial', count: 150 },
    { icon: 'pi pi-map', name: 'Land', count: 95 },
    { icon: 'pi pi-briefcase', name: 'Offices', count: 210 },
    { icon: 'pi pi-key', name: 'Rentals', count: 560 },
  ];

  protected readonly featuredProperties: Property[] = [
    {
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop',
      title: 'Sunset Villa Residence',
      location: 'Beverly Hills, CA',
      price: '$1,250,000',
      type: 'Villa',
      beds: 4,
      baths: 3,
      sqft: '3,200',
      isNew: true,
    },
    {
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop',
      title: 'Skyline Penthouse',
      location: 'Manhattan, NY',
      price: '$2,800,000',
      type: 'Penthouse',
      beds: 3,
      baths: 2,
      sqft: '2,800',
      isNew: false,
    },
    {
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop',
      title: 'Modern Urban Loft',
      location: 'Austin, TX',
      price: '$680,000',
      type: 'Apartment',
      beds: 2,
      baths: 2,
      sqft: '1,400',
      isNew: true,
    },
    {
      image: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=600&h=400&fit=crop',
      title: 'Lakefront Estate',
      location: 'Lake Tahoe, NV',
      price: '$3,450,000',
      type: 'Villa',
      beds: 5,
      baths: 4,
      sqft: '4,500',
      isNew: false,
    },
    {
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop',
      title: 'Palm Springs Retreat',
      location: 'Palm Springs, CA',
      price: '$890,000',
      type: 'Villa',
      beds: 3,
      baths: 2,
      sqft: '2,200',
      isNew: true,
    },
    {
      image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop',
      title: 'Downtown Studio',
      location: 'Chicago, IL',
      price: '$320,000',
      type: 'Apartment',
      beds: 1,
      baths: 1,
      sqft: '750',
      isNew: false,
    },
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

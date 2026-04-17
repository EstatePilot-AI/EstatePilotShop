import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { PropertyCard } from '../../models/chatbot.model';

@Component({
  selector: 'app-property-chat-card',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './property-chat-card.html',
  styleUrl: './property-chat-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyChatCard {
  readonly property = input.required<PropertyCard>();

  readonly resolvedPropertyId = computed<number | null>(() => {
    const raw = this.property().propertyId ?? this.property()['property_id'] ?? this.property()['id'];
    const numericId = Number(raw);

    if (!Number.isFinite(numericId) || numericId <= 0) {
      return null;
    }

    return Math.trunc(numericId);
  });

  readonly propertyLink = computed(() => {
    const id = this.resolvedPropertyId();
    return id ? ['/properties', id] : ['/properties/list'];
  });

  readonly formattedPrice = computed(() => {
    const price = this.property().price;
    if (price == null) return '';
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(price);
  });

  readonly displayType = computed(() => {
    const type = this.property().propertyType;
    if (!type) return '';
    return type
      .split(/\s+/)
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  });

  readonly displayLocation = computed(() => {
    const p = this.property();
    const parts = [p.district, p.city, p.governorate].filter(Boolean);
    return parts.length ? parts.join(', ') : '';
  });

  readonly hasMeta = computed(() => {
    const p = this.property();
    return !!(p.area || p.rooms || p.bathrooms || p.floorNumber);
  });
}

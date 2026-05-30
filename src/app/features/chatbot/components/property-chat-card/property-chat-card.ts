import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { PropertyCard } from '../../models/chatbot.model';
import { formatPropertyPrice, resolvePropertyId } from '../../utils/chatbot-normalizer';
import { ChatIcon, ChatIconName } from '../chat-icon/chat-icon';

interface PropertyMetaItem {
  icon: ChatIconName;
  value: string;
  labelKey: string;
  suffix?: string;
}

@Component({
  selector: 'app-property-chat-card',
  imports: [RouterLink, TranslatePipe, ChatIcon],
  templateUrl: './property-chat-card.html',
  styleUrl: './property-chat-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PropertyChatCard {
  readonly property = input.required<PropertyCard>();

  readonly resolvedPropertyId = computed<number | null>(() => {
    return resolvePropertyId(this.property());
  });

  readonly propertyLink = computed(() => {
    const id = this.resolvedPropertyId();
    return id ? ['/properties', id] : ['/properties/list'];
  });

  readonly formattedPrice = computed(() => {
    return formatPropertyPrice(this.property().price);
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
    return this.metaItems().length > 0;
  });

  readonly metaItems = computed<PropertyMetaItem[]>(() => {
    const p = this.property();
    const items: PropertyMetaItem[] = [];

    if (p.area != null) {
      items.push({
        icon: 'area',
        value: String(p.area),
        labelKey: 'CHATBOT.AREA',
        suffix: 'm²',
      });
    }

    if (p.rooms != null) {
      items.push({
        icon: 'bed',
        value: String(p.rooms),
        labelKey: 'CHATBOT.ROOMS',
      });
    }

    if (p.bathrooms != null) {
      items.push({
        icon: 'bath',
        value: String(p.bathrooms),
        labelKey: 'CHATBOT.BATHROOMS',
      });
    }

    if (p.floorNumber != null) {
      items.push({
        icon: 'building',
        value: String(p.floorNumber),
        labelKey: 'CHATBOT.FLOOR',
      });
    }

    return items;
  });
}

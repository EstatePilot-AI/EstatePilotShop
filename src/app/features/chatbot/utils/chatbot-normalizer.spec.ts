import {
  CHATBOT_MAX_PROPERTY_CARDS,
  formatPropertyPrice,
  normalizeAdvisorResponse,
  resolvePropertyId,
  trackPropertyCard,
} from './chatbot-normalizer';
import { AdvisorResponse, PropertyCard } from '../models/chatbot.model';

function property(id: number): PropertyCard {
  return {
    propertyId: id,
    propertyType: 'apartment',
    price: id * 1000,
  };
}

describe('chatbot normalizer utilities', () => {
  it('resolves canonical and alternate property ids explicitly', () => {
    expect(resolvePropertyId({ propertyId: 12 })).toBe(12);
    expect(resolvePropertyId({ property_id: '13' })).toBe(13);
    expect(resolvePropertyId({ id: 14.9 })).toBe(14);
    expect(resolvePropertyId({ propertyId: 0 })).toBeNull();
    expect(resolvePropertyId({ id: 'not-a-number' })).toBeNull();
  });

  it('normalizes partial advisor responses with safe defaults and card limits', () => {
    const raw = {
      module: 'Search',
      fallback_used: true,
      top_properties: Array.from({ length: 20 }, (_, index) => property(index + 1)),
    } satisfies Partial<AdvisorResponse>;

    const normalized = normalizeAdvisorResponse(raw);

    expect(normalized.module).toBe('Search');
    expect(normalized.text).toBe('');
    expect(normalized.translationKey).toBe('CHATBOT.ERROR_GENERIC');
    expect(normalized.fallbackUsed).toBe(true);
    expect(normalized.topProperties).toHaveLength(CHATBOT_MAX_PROPERTY_CARDS);
    expect(normalized.comparison).toEqual([]);
    expect(normalized.recommendation).toBeNull();
    expect(normalized.negotiation).toBeNull();
  });

  it('deduplicates comparison cards against top properties by normalized id', () => {
    const normalized = normalizeAdvisorResponse({
      module: 'Compare',
      fallback_used: false,
      explanation: 'Compare these',
      reply_in_egyptian_arabic: '',
      top_properties: [property(1)],
      comparison: [{ property_id: 1 }, { id: 2 }],
    } as unknown);

    expect(normalized.comparison.map((card) => resolvePropertyId(card))).toEqual([2]);
  });

  it('formats prices without dropping zero values', () => {
    expect(formatPropertyPrice(null)).toBe('');
    expect(formatPropertyPrice(undefined)).toBe('');
    expect(formatPropertyPrice(0)).toContain('EGP');
    expect(formatPropertyPrice(1_500_000)).toContain('1,500,000');
  });

  it('tracks cards by normalized id with an index fallback', () => {
    expect(trackPropertyCard(3, { property_id: '99' })).toBe(99);
    expect(trackPropertyCard(3, { propertyType: 'unknown' })).toBe('missing-3');
  });
});

import { AdvisorModule, AdvisorResponse, PropertyCard } from '../models/chatbot.model';

export const CHATBOT_MAX_MESSAGES = 100;
export const CHATBOT_MAX_PROPERTY_CARDS = 12;
export const CHATBOT_ERROR_TEXT_KEY = 'CHATBOT.ERROR_GENERIC';

const priceFormatter = new Intl.NumberFormat('en-EG', {
  style: 'currency',
  currency: 'EGP',
  maximumFractionDigits: 0,
});

export interface NormalizedAdvisorResponse {
  module: AdvisorModule;
  text: string;
  translationKey?: string;
  topProperties: PropertyCard[];
  recommendation: PropertyCard | null;
  comparison: PropertyCard[];
  negotiation: PropertyCard | null;
  fallbackUsed: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function stringOrEmpty(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function arrayOrEmpty(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function resolvePropertyId(property: unknown): number | null {
  if (!isRecord(property)) return null;

  const raw = property['propertyId'] ?? property['property_id'] ?? property['id'];
  const numericId = Number(raw);

  if (!Number.isFinite(numericId) || numericId <= 0) {
    return null;
  }

  return Math.trunc(numericId);
}

function normalizeProperty(value: unknown): PropertyCard | null {
  if (!isRecord(value)) return null;

  const property = { ...value } as PropertyCard;
  const id = resolvePropertyId(property);

  if (id !== null) {
    property.propertyId = id;
  }

  return property;
}

function normalizePropertyList(value: unknown, limit = CHATBOT_MAX_PROPERTY_CARDS): PropertyCard[] {
  return arrayOrEmpty(value)
    .map(normalizeProperty)
    .filter((property): property is PropertyCard => property !== null)
    .slice(0, limit);
}

function dedupeAgainst(properties: PropertyCard[], existingIds: Set<number>): PropertyCard[] {
  const result: PropertyCard[] = [];

  for (const property of properties) {
    const id = resolvePropertyId(property);
    if (id !== null) {
      if (existingIds.has(id)) continue;
      existingIds.add(id);
    }
    result.push(property);
  }

  return result;
}

export function normalizeAdvisorResponse(value: unknown): NormalizedAdvisorResponse {
  const payload = isRecord(value) ? value : {};
  const topProperties = normalizePropertyList(payload['top_properties']);
  const seenIds = new Set(
    topProperties
      .map((property) => resolvePropertyId(property))
      .filter((id): id is number => id !== null),
  );
  const comparison = dedupeAgainst(
    normalizePropertyList(payload['comparison']),
    seenIds,
  ).slice(0, CHATBOT_MAX_PROPERTY_CARDS);
  const replyText = stringOrEmpty(payload['reply_in_egyptian_arabic']);
  const explanationText = stringOrEmpty(payload['explanation']);
  const text = replyText || explanationText;

  return {
    module: stringOrEmpty(payload['module']) || 'Guided Conversation',
    text,
    translationKey: text ? undefined : CHATBOT_ERROR_TEXT_KEY,
    topProperties,
    recommendation: normalizeProperty(payload['recommendation']),
    comparison,
    negotiation: normalizeProperty(payload['negotiation']),
    fallbackUsed: payload['fallback_used'] === true,
  };
}

export function formatPropertyPrice(price: number | null | undefined): string {
  if (price == null || !Number.isFinite(price)) return '';

  return priceFormatter.format(price);
}

export function trackPropertyCard(index: number, property: unknown): number | string {
  return resolvePropertyId(property) ?? `missing-${index}`;
}

export function limitChatMessages<T>(messages: readonly T[]): T[] {
  return messages.slice(-CHATBOT_MAX_MESSAGES);
}

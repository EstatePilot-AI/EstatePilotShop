export type AdvisorModule =
  | 'Search'
  | 'Recommend'
  | 'Compare'
  | 'Negotiate'
  | 'Guided Conversation'
  | 'Selection'
  | string;

export interface AdvisorRequest {
  user_id: number;
  query: string;
}

export interface PropertyCard {
  propertyId: number;
  propertyType?: string;
  finishingType?: string;
  propertyStatus?: string;
  price?: number;
  area?: number;
  rooms?: number;
  bathrooms?: number;
  district?: string;
  city?: string;
  governorate?: string;
  country?: string;
  floorNumber?: number;
  street?: string;
  [key: string]: unknown;
}

export interface ExtractedFilters {
  propertyType?: string | null;
  finishingType?: string | null;
  min_price?: number | null;
  max_price?: number | null;
  min_area?: number | null;
  max_area?: number | null;
  rooms?: number | null;
  bathrooms?: number | null;
  governorate?: string | null;
  city?: string | null;
  district?: string | null;
  [key: string]: unknown;
}

export interface AdvisorResponse {
  module: AdvisorModule;
  filters_extracted: ExtractedFilters;
  top_properties: PropertyCard[];
  recommendation?: PropertyCard | null;
  comparison?: PropertyCard[] | null;
  negotiation?: PropertyCard | null;
  fallback_used: boolean;
  explanation: string;
  reply_in_egyptian_arabic: string;
}

export interface SmartSearchRequest {
  query: string;
  top_k?: number;
}

export interface SmartSearchResponse {
  property_ids: number[];
}

export type ChatMessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  text: string;
  timestamp: number;
  properties?: PropertyCard[];
  recommendation?: PropertyCard;
  module?: AdvisorModule;
  fallbackUsed?: boolean;
}

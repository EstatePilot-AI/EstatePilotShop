export interface IProperty {
  propertyId: number;
  price: number;
  area: number;
  propertyType: string;
  status: string;
  city: string;
  district: string;
  createdAt: string;
  imageURLs?: string[];
}

export interface IPaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface IPropertyDetail extends IProperty {
  propertyStatus: string;
  finishingType: string;
  rooms: number;
  bathrooms: number;
  country: string;
  governorate: string;
  street: string;
  buildingNumber: number;
  floorNumber: number;
  apartmentNumber: number;
}

export interface IUpdatePropertyPayload {
  propertyType?: number | null;
  finishingType?: number | null;
  negotiable?: boolean | null;
  price?: number | null;
  area?: number | null;
  rooms?: number | null;
  bathrooms?: number | null;
  country?: string;
  governorate?: string;
  city?: string;
  district?: string;
  street?: string;
  buildingNumber?: number | null;
  floorNumber?: number | null;
  apartmentNumber?: number | null;
  imageFiles?: File[];
}

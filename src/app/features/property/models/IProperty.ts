export interface IProperty {
  propertyId : number;
  price: number;
  area: number;
  propertyType: string;
  status: string;
  city: string;
  district: string;
  imageURLs?: string[];
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
  imageURLs?: string[];
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

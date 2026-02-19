export interface IProperty {
  propertyId : number;
  price: number;
  area: number;
  propertyType: string;
  status: string;
  city: string;
  district: string;
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

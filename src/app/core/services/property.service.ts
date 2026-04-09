import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';
import {
  IProperty,
  IPropertyDetail,
  IUpdatePropertyPayload,
} from '../../features/property/models/IProperty';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private readonly api = inject(ApiService);
  private readonly imageBaseUrl = environment.apiUrl.replace(/\/api\/?$/, '');

  getAllProperties(): Observable<IProperty[]> {
    return this.api.get<IProperty[]>('property/GetAllProperties');
  }

  buildPropertyImageUrl(imageFileName: string): string {
    return `${this.imageBaseUrl}/Images/${encodeURIComponent(imageFileName)}`;
  }

  getPropertyById(id: number): Observable<IPropertyDetail> {
    return this.api.get<IPropertyDetail>(`property/GetPropertyById/${id}`);
  }

  globalSearch(term: string): Observable<IProperty[]> {
    const params = new HttpParams().set('term', term.trim());
    return this.api.get<IProperty[]>('property/GlobalSearch', { params });
  }

  updateProperty(id: number, payload: IUpdatePropertyPayload): Observable<void> {
    let params = new HttpParams();

    const appendQueryParam = (key: string, value: unknown): void => {
      if (value === null || value === undefined) return;

      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return;
        params = params.set(key, trimmed);
        return;
      }

      params = params.set(key, String(value));
    };

    appendQueryParam('PropertyType', payload.propertyType);
    appendQueryParam('FinishingType', payload.finishingType);
    appendQueryParam('Negotiable', payload.negotiable);
    appendQueryParam('Price', payload.price);
    appendQueryParam('Area', payload.area);
    appendQueryParam('Rooms', payload.rooms);
    appendQueryParam('Bathrooms', payload.bathrooms);
    appendQueryParam('Country', payload.country);
    appendQueryParam('Governorate', payload.governorate);
    appendQueryParam('City', payload.city);
    appendQueryParam('District', payload.district);
    appendQueryParam('Street', payload.street);
    appendQueryParam('BuildingNumber', payload.buildingNumber);
    appendQueryParam('FloorNumber', payload.floorNumber);
    appendQueryParam('ApartmentNumber', payload.apartmentNumber);

    const formData = new FormData();
    for (const imageFile of payload.imageFiles ?? []) {
      formData.append('ImageURLs', imageFile, imageFile.name);
    }

    return this.api.put<void>(`Property/UpdateProperty/${id}`, formData, { params });
  }
}

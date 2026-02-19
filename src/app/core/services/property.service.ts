import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';
import { IProperty, IPropertyDetail } from '../../features/property/models/IProperty';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PropertyService {
  private readonly api = inject(ApiService);

  getAllProperties(): Observable<IProperty[]> {
    return this.api.get<IProperty[]>('property/GetAllProperties');
  }

  getPropertyById(id: number): Observable<IPropertyDetail> {
    return this.api.get<IPropertyDetail>(`property/GetPropertyById/${id}`);
  }

  globalSearch(term: string): Observable<IProperty[]> {
    const params = new HttpParams().set('term', term.trim());
    return this.api.get<IProperty[]>('property/GlobalSearch', { params });
  }
}

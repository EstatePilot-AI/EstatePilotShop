import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { IContactRequest } from '../../features/contact/models/IContact';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private readonly api = inject(ApiService);

  addBuyerContact(propertyId: number, contact: IContactRequest): Observable<void> {
    return this.api.post<void>(`Contact/AddBuyerContact${propertyId}`, contact);
  }
}

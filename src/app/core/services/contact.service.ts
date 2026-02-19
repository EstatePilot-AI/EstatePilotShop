import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ContactService {

  private api = inject(ApiService);

  // Post addBuyerContact
  addBuyerContact(contact: any) {
    return this.api.post('contact/addBuyerContact', contact);
  }
}

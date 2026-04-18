import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { environment } from '../../../../environments/environments';
import {
  AdvisorRequest,
  AdvisorResponse,
  SmartSearchRequest,
  SmartSearchResponse,
} from '../models/chatbot.model';

@Injectable({ providedIn: 'root' })
export class ChatbotApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.chatbotApiUrl;
  private readonly advisorTimeoutMs = 60000;
  private readonly smartSearchTimeoutMs = 15000;

  askAdvisor(payload: AdvisorRequest): Observable<AdvisorResponse> {
    return this.http
      .post<AdvisorResponse>(`${this.baseUrl}/advisor`, payload)
      .pipe(timeout(this.advisorTimeoutMs));
  }

  smartSearch(payload: SmartSearchRequest): Observable<SmartSearchResponse> {
    return this.http
      .post<SmartSearchResponse>(`${this.baseUrl}/smartsearch`, payload)
      .pipe(timeout(this.smartSearchTimeoutMs));
  }
}

import { Injectable } from '@angular/core';
import { environment } from '../../../environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  get<T>(endpoint: string, options?: object): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, options as object) as Observable<T>;
  }

  post<T>(endpoint: string, body: unknown, options?: object): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, body, options as object) as Observable<T>;
  }

  put<T>(endpoint: string, body: unknown, options?: object): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, body, options as object) as Observable<T>;
  }

  delete<T>(endpoint: string, options?: object): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`, options as object) as Observable<T>;
  }
}

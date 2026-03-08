import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class StripeApiService {

  constructor(private http: HttpClient) {}

  private apiUrl = environment.apiUrl;

  createCheckoutSession(eventId: number) {
    return this.http.post<{id:string, url:string}>(
      `${this.apiUrl}/stripe/checkout/${eventId}`,
      {}, 
      { withCredentials: true }
    )

  }
}

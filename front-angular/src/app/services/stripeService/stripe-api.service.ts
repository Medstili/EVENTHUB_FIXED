import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StripeApiService {

  constructor(private http: HttpClient) {}

  private apiUrl = 'http://localhost:8000/api';

  createCheckoutSession(eventId: number) {
    return this.http.post<{id:string}>(
      `${this.apiUrl}/stripe/checkout/${eventId}`,
      {}, 
      { withCredentials: true }
    )

  }
}

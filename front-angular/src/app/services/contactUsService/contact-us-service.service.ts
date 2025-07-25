import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}



@Injectable({
  providedIn: 'root'
})

export class ContactUsServiceService {
  private apiUrl: string ='http://localhost:8000/api/' ;
  constructor(private http: HttpClient) { }
  



  // Send a message as a guest (contact form)
  sendMessage(payload: ContactPayload) {
    return this.http.post<{ message: string; conversation_id: number }>(
      `${this.apiUrl}contact`,
      payload
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(err: HttpErrorResponse) {
    let msg = 'An unknown error occurred';
    if (err.error && err.error.message) {
      msg = err.error.message;
    } else if (err.status === 0) {
      msg = 'Cannot connect to server';
    }
    return throwError(() => msg);
  }
}

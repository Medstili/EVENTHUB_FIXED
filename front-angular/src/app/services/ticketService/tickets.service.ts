import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, Paginated } from '../eventService/event.service';
import { User } from '../authService/login.service';

export interface Ticket {
    id:number;
    status:string;
    price:number;
    QR_code:string;
    created_at:string;
    event:Event;
    user:User;
}


@Injectable({ providedIn: 'root' })
export class TicketService {
  private readonly apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  getTickets(): Observable<Ticket[]> {
    return this.http.get<Ticket[]>(`${this.apiUrl}/user-tickets`, { withCredentials: true });
  }

  getTotalTickets(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/tickets/total`, {withCredentials: true});
  }

  getById(id:number): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.apiUrl}/tickets/${id}`, { withCredentials: true });
  }
  downloadPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/user-tickets/${id}/download`, { responseType: 'blob', withCredentials: true })
  }
  // getAllTickets(filters: Record<string, any> = {}, page = 1): Observable<Paginated<Ticket>> {
  //   let params = new HttpParams().set('page', String(page));
  //   Object.entries(filters).forEach(([k,v]) => {
  //     if (v !== null && v !== undefined) {
  //       params = params.set(k, String(v));
  //     }
  //   });
  //   return this.http.get<Paginated<Ticket>>(`${this.apiUrl}/tickets`, { params, withCredentials: true });
  // }
  // cancelTicket(id: number){
  //   const params = new HttpParams().set('id', String(id));
  //   return this.http.patch(`${this.apiUrl}/cancel-ticket`, null, { params, withCredentials: true });
  // }
  
}
  


import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { Paginated } from '../eventService/event.service';
import { LoginService, User } from '../authService/login.service';
import { Event as MyEvent } from '../eventService/event.service';
import { Ticket } from '../ticketService/tickets.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  baseUrl = 'http://localhost:8000/api';
  constructor(private http: HttpClient, private loginService: LoginService) { }

// cards
  // getAllUsersCount(): Observable<number>{
  //   return this.http.get<number>(`${this.baseUrl}/admin/total-users`, {withCredentials: true})
  // }
  // getAllEventsCount(): Observable<number>{
  //   return this.http.get<number>(`${this.baseUrl}/admin/total-events`, {
  //     withCredentials: true
  //   });
  // }
  // getAllTicketsCount(): Observable<number> {
  //   return this.http.get<number>(`${this.baseUrl}/admin/total-tickets`, {withCredentials: true});
  // }
  // pie chart
  // get_All_Or_Pr_Users(): Observable<[]>{
  //   return this.http.get<[]>(`${this.baseUrl}/admin/Or-Pr-Users`, {withCredentials: true})
  // }
  // doughchart
  get_All_Pb_Pr_Events(): Observable<any>{
    return this.http.get<any>(`${this.baseUrl}/admin/Pb-Pr-Events`, {withCredentials: true})
  }
  // bar chart
  getTopEvents(): Observable<any>{
    return this.http.get<any>(`${this.baseUrl}/admin/top-events`, {withCredentials: true})
  }

  getAllUsers(filters: Record<string, any> = {}, page = 1): Observable<Paginated<User>> {
    let params = new HttpParams().set('page', String(page));
    Object.entries(filters).forEach(([k,v]) => {
      if (v !== null && v !== undefined) {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<Paginated<User>>(`${this.baseUrl}/admin/user`, { params, withCredentials: true });
  }
  updateUser(data: FormData) {
      const currentUser = this.loginService.user();
      if (!currentUser) {
        console.error('No user found');
        return throwError(() => new Error('User not authenticated'));
      }
      
      return this.http.post(
        `${this.baseUrl}/admin/user/${currentUser.id}`, 
        data, 
        { withCredentials: true }
      );
  }
  getAllEvents(filters: Record<string, any> = {}, page = 1): Observable<Paginated<MyEvent>> {
      let params = new HttpParams().set('page', String(page));
      Object.entries(filters).forEach(([k,v]) => {
        if (v !== null && v !== undefined) {
          params = params.set(k, String(v));
        }
      });
      return this.http.get<Paginated<MyEvent>>(`${this.baseUrl}/admin/events`, { params, withCredentials: true });
  }
  
  updateEvent(id: number, payload: FormData) {
    return this.http.post(`${this.baseUrl}/admin/events/${id}`, payload, {
      withCredentials: true
    })
  }

  deleteEvent(id: number) {
    return this.http.delete(`${this.baseUrl}/admin/events/${id}`, {
      withCredentials: true
    });
  }

  getEventById(id: number): Observable<MyEvent> {
    console.log(`Fetching event with ID: ${id}`);
    return this.http.get<MyEvent>(`${this.baseUrl}/admin/events/${id}`, { withCredentials: true });
  }

  createEvent(payload: FormData) {
    return this.http.post(`${this.baseUrl}/admin/events`, payload, {
      withCredentials: true
    });
  }

  getUserEvents(): Observable<MyEvent[]> {
    return this.http.get<MyEvent[]>(`${this.baseUrl}/admin/user-events`, {
      withCredentials: true
    });
  }

  getAllTickets(filters: Record<string, any> = {}, page = 1): Observable<Paginated<Ticket>> {
    let params = new HttpParams().set('page', String(page));
    Object.entries(filters).forEach(([k,v]) => {
      if (v !== null && v !== undefined) {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<Paginated<Ticket>>(`${this.baseUrl}/admin/tickets`, { params, withCredentials: true });
  }
  cancelTicket(id: number){
    const params = new HttpParams().set('id', String(id));
    return this.http.patch(`${this.baseUrl}/admin/cancel-ticket`, null, { params, withCredentials: true });
  }

  get_tickets_sold_each_month(): Observable<any>{
    return this.http.get<any>(`${this.baseUrl}/admin/tickets/tickets-sold-each-month`, {withCredentials: true})
  }
  
  // Enhanced dashboard methods
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin/dashboard/stats`, {
      withCredentials: true
    });
  }

  // getTicketStats(): Observable<any> {
  //   return this.http.get<any>(`${this.baseUrl}/admin/dashboard/ticket-stats`, {
  //     withCredentials: true
  //   });
  // }

  getRecentActivity(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin/dashboard/recent-activity`, {
      withCredentials: true
    });
  }

  getUserDistribution(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin/dashboard/user-distribution`, {
      withCredentials: true
    });
  }

  getUserGrowth(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin/dashboard/user-growth`, {
      withCredentials: true
    });
  }

  // getTopOrganizers(): Observable<any> {
  //   return this.http.get<any>(`${this.baseUrl}/admin/dashboard/top-organizers`, {
  //     withCredentials: true
  //   });
  // }

  getTicketSalesByCategory(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin/dashboard/ticket-sales-by-category`, {
      withCredentials: true
    });
  }

  getRevenueOverview(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/admin/dashboard/revenue-overview`, {
      withCredentials: true
    });
  }
  
}

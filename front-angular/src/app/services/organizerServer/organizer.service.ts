import { Injectable } from '@angular/core';
import { LoginService, User } from '../authService/login.service';
import { Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http'
import { Event } from '../eventService/event.service';

export interface EventsCount {
  total: number;
  public: number;
  private: number;
}

export interface MonthRevenue {
  month: number;
  revenue: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizerService {
  baseUrl = 'http://localhost:8000/api/organizer';

  // user!: User|null;

  constructor( private loginService: LoginService, private http: HttpClient) {
    // this.user = this.loginService.user()
   }
  updateAccount(data: FormData) {
    const currentUser = this.loginService.user();
    if (!currentUser) {
      console.error('OrganizerService: No user found for updateAccount.');
      return throwError(() => new Error('User not authenticated'));
    }
    
    return this.http.post(
      `${this.baseUrl}/user/${currentUser.id}`, 
      data, 
      { withCredentials: true }
    );
  }
  deleteAccount(){
    const currentUser = this.loginService.user();
    if (!currentUser) {
      console.error('OrganizerService: No user logged in to delete account.');
      return throwError(() => new Error('User not authenticated for deletion.'));
    }

    return this.http.delete(`${this.baseUrl}/user/${currentUser!.id}`, {withCredentials: true})    
  }
  getOrganizerEventsCount(): Observable<EventsCount> {
    return this.http.get<EventsCount>(`${this.baseUrl}/events/count`, { withCredentials: true });
  }
  // dashboard statistics
  getUpcomingEvents(): Observable<{ count: number; events: Event[] }> {
    return this.http.get<{ count: number; events: Event[] }>(`${this.baseUrl}/upcoming-events`, {
      withCredentials: true
    });

  }
  getPastEvents(): Observable<{ count: number; events: Event[] }>{
    return this.http.get<{ count: number; events: Event[] }>(`${this.baseUrl}/past-events`, {
      withCredentials: true
    });
  }
  getTotalTicketsSold(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/total-tickets-sold`, {
      withCredentials: true
    });
  }
  
  // getTotalTicketSoldByevent(id: number) {
  //   return this.http.get(`${this.baseUrl}/total-tickets-sold/${id}`, { withCredentials: true });
  // }

  getRevenue(): Observable<MonthRevenue[]> {
    return this.http.get<MonthRevenue[]>(`${this.baseUrl}/revenue`, { withCredentials: true })
  }

  getTicketsPurchasedLastWeek(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/tickets-purchased-last-week`, {
      withCredentials: true
    });
  }
  getOrganizerEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.baseUrl}/events`, {
      withCredentials: true
    });
  }

  getMostTicketSales(): Observable<{ name: string; value: number }[]> {
    return this.http
      .get<{ name: string; value: number }[]>(`${this.baseUrl}/most-ticket-sales`, {
        withCredentials: true,
      });
  }

  deleteOrganizerEvent(id: number) {
    return this.http.delete(`${this.baseUrl}/events/${id}`, {
      withCredentials: true
    });
  }
  getUserEventsCount(): Observable<EventsCount> {
    return this.http.get<EventsCount>(`${this.baseUrl}/dashboard/events/count`, { withCredentials: true });
  }

  updateEvent(id: number, payload: FormData) {
   
    return this.http.post(`${this.baseUrl}/events/${id}`, payload, {
      withCredentials: true
    })
  }

  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.baseUrl}/events/${id}`, { withCredentials: true });
  }

  createEvent(payload: FormData) {
    return this.http.post(`${this.baseUrl}/events`, payload, {
      withCredentials: true
    });
  }

  // Enhanced dashboard methods
  getDashboardStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/stats`, {
      withCredentials: true
    });
  }

  getTicketStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/ticket-stats`, {
      withCredentials: true
    });
  }

  getRevenueOverview(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/revenue-overview`, {
      withCredentials: true
    });
  }
}

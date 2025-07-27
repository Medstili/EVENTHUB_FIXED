// src/app/events/event.service.ts
import { Injectable }     from '@angular/core';
import { HttpClient, HttpParams }     from '@angular/common/http';
import { Observable }     from 'rxjs';
import {  Router } from '@angular/router';
import { User } from '../authService/login.service';
import { Category } from '../categoryService/category.service';


export interface Event {
    id: number;
    organizer_id: number;
    category_id: number;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    city: string;
    image: string;
    capacity: number;
    current_registrations: number;
    is_public: number;
    price: string;
    created_at: string;
    updated_at: string;
    image_url: string; 
    totalTicketsSold: number; 
    user: User;
    category: Category
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface MonthRevenue {
  month: number;
  revenue: number;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private baseUrl = 'http://localhost:8000/api/';
  private apiEventsUrl = `${this.baseUrl}guess/home/events/`;
  private apiEventByIdsUrl = `${this.baseUrl}events`;
  private guessApiEventByIdsUrl = `${this.baseUrl}guess/event/`;
 




  constructor(private http: HttpClient, private router: Router) {}


  getAll(filters: Record<string, any> = {}, page = 1): Observable<Paginated<Event>> {
    let params = new HttpParams().set('page', String(page));
    Object.entries(filters).forEach(([k,v]) => {
      if (v !== null && v !== undefined) {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<Paginated<Event>>(this.apiEventsUrl, { params, withCredentials: true });
  }

  guessGetById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.guessApiEventByIdsUrl}${id}`, { withCredentials: true });
  }

  getTotalEvents(): Observable<number>{
    return this.http.get<number>(`${this.baseUrl}events/total`, {
      withCredentials: true
    });
  }

  getById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiEventByIdsUrl}/${id}`, { withCredentials: true });
  }

  /** Create a new event */
  createEvent(payload: FormData) {
    return this.http.post(this.apiEventByIdsUrl, payload, {
      withCredentials: true
    });
  }

  /** Update an event by ID */
  updateEvent(id: number, payload: FormData) {
    return this.http.post(`${this.apiEventByIdsUrl}/${id}`, payload, {
      withCredentials: true
    })
  }

  /** Delete an event by ID */
  deleteEvent(id: number) {
    return this.http.delete(`${this.apiEventByIdsUrl}/${id}`, {
      withCredentials: true
    });
  }

  /** Fetch events by category ID */
  getByCategoryId(categoryId: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiEventsUrl}?category=${categoryId}`, { withCredentials: true });
  }

  /** Fetch events by user ID */
  getByUserId(userId: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiEventsUrl}?user=${userId}`, { withCredentials: true });
  }

  /** Fetch events for current organizer */
  getUserEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.baseUrl}admin/events`, {
      withCredentials: true
    });
  }

  /** Get the latest event for hero section */
  getLatestEvent(): Observable<Event> {
    return this.http.get<Event>(`${this.baseUrl}guess/latest-event`, {
      withCredentials: true
    });
  }


  


  

}

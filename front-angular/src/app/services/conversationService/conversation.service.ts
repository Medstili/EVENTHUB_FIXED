import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

export interface Message {
  id: number;
  conversation_id: number;
  sender_type: string;
  sender_id: string;
  body: string;
  is_read: boolean ;
  created_at: string;
  updated_at: string;
}

export interface MessageStats {
  total: number;
  unread: number;
  read: number;
  solved: number;
  not_solved: number;
}

export interface Conversation {
  id: number;
  // guest_info: { name: string; email: string };
  guest_name: string,
  guest_email: string,
  status: 'solved' | 'unsolved';
  last_message_at: string;
  messages: Message[];
}

@Injectable({
  providedIn: 'root'
})
export class ConversationService {

  private apiUrl: string ='http://localhost:8000/api/' ;
  constructor(private http: HttpClient) { }


  getConversationMessages(id: number){
    return this.http.get<Conversation>(
      `${this.apiUrl}admin/dashboard/conversations/${id}`,
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
    }
  getConversations(
    page: number = 1,
    filters: { status?: string; read?: string; email?: string; pageSize?: number } = {}
  ): Observable<{ data: Conversation[], total: number, current_page: number, last_page: number }> {
    let params = `?page=${page}`;
    if (filters.status && filters.status !== 'all') {
      // if (filters.status === 'solved' || filters.status === 'unsolved') {
      //   params += `&status=${filters.status}`;
      // } else if (filters.status === 'read' || filters.status === 'unread') {
      //   params += `&read=${filters.status}`;
      // }
      params += `&status=${filters.status}`;

    }
    if (filters.email) {
      params += `&email=${encodeURIComponent(filters.email)}`;
    }
    if (filters.pageSize) {
      params += `&per_page=${filters.pageSize}`;
    }
    return this.http.get<{ data: Conversation[], total: number, current_page: number, last_page: number }>(
      `${this.apiUrl}admin/dashboard/conversations${params}`,
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }
  // Fetch conversation stats for admin
  getConversationStats(): Observable<MessageStats> {
    return this.http.get<MessageStats>(`${this.apiUrl}admin/dashboard/conversations/stats`, { withCredentials: true })
      .pipe(
        catchError(this.handleError)
      );
  }
  sendMessage(id: number, message: string) {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}admin/dashboard/conversations/${id}/reply`,
      { message },
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }
  updateStatus(id: number, status: string): Observable<any> {
    return this.http.patch(
      `${this.apiUrl}admin/dashboard/conversations/${id}/status`,
      { status },
      { withCredentials: true }
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

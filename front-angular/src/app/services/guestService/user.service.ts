import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginService, User } from '../authService/login.service';
import { Observable } from 'rxjs';

export interface EventsCount {
  total: number;
  public: number;
  private: number;
}

@Injectable({
  providedIn: 'root'
})

export class UserService {
  baseUrl = 'http://localhost:8000/api';
  user!: User|null;

  constructor(private  http: HttpClient, private loginService: LoginService ) { 
    this.user = this.loginService.user()
  }

  getOrganizersCount(): Observable<number>{
    return this.http.get<number>(`${this.baseUrl}/organizer/total`, {withCredentials:true});
  }
  
}


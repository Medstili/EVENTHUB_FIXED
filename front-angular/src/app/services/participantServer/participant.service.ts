import { HttpClient } from '@angular/common/http';
import { Injectable  } from '@angular/core';
import { LoginService, User } from '../authService/login.service';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParticipantService{
  baseUrl = 'http://localhost:8000/api/participant';
  // user!: User|null;

  constructor(private http: HttpClient, private loginService: LoginService ) { 
        // this.user = this.loginService.user()
  }


  deleteAccount(){
    const currentUser = this.loginService.user();
    if (!currentUser) {
      console.error('ParticipantService: No user logged in to delete account.');
      return throwError(() => new Error('User not authenticated for deletion.'));
    }

    return this.http.delete(`${this.baseUrl}/user/${currentUser!.id}`, {withCredentials: true})    
  }

  updateUser(data: FormData) {
    const currentUser = this.loginService.user();
    if (!currentUser) {
      console.error('ParticipantService: No user found for updateUser.');
      return throwError(() => new Error('User not authenticated'));
    }
    
    return this.http.post(
      `${this.baseUrl}/user/${currentUser.id}`, 
      data, 
      { withCredentials: true }
    );
  }
}

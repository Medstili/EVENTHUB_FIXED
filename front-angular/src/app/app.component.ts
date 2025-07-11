import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginService, User } from './services/authService/login.service';
import { RouterModule } from '@angular/router';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './app.component.html'
})
export class AppComponent {
  public user!: User | null;

  constructor(
    private loginService: LoginService,
    private themeService: ThemeService
  ) {
    this.user = this.loginService.isLoggedIn() ? this.loginService.user() : null;
  }
}

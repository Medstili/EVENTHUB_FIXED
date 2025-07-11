import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule, MatNavList } from '@angular/material/list';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../services/authService/login.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '../../services/theme.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-participant',
  imports: [
 CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './participant.component.html',
  styleUrl: './participant.component.scss'
})
export class ParticipantComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  isHandset$ : Observable<boolean>;

  constructor(
    private auth: LoginService, 
    private router: Router, 
    private bp: BreakpointObserver,
    public themeService: ThemeService
  ) {
    this.isHandset$ = this.bp.observe([Breakpoints.Handset])
    .pipe(
      map(result => result.matches)
    );
  }

  get isDarkMode() {
    return this.themeService.isDarkMode();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout() {
    this.auth.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}

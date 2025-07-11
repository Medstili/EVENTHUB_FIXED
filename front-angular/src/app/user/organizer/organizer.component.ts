import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenav, MatSidenavModule }    from '@angular/material/sidenav';
import { MatListModule }       from '@angular/material/list';
import { MatToolbarModule }    from '@angular/material/toolbar';
import { MatIconModule }       from '@angular/material/icon';
import { MatButtonModule }     from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoginService } from '../../services/authService/login.service';
import { ThemeService } from '../../services/theme.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-organizer',
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
  templateUrl: './organizer.component.html',
  styleUrl: './organizer.component.scss'
})
export class OrganizerComponent {
   @ViewChild('sidenav') sidenav!: MatSidenav;
   isHandset$: Observable<boolean> = of(false);

  constructor(
    private auth: LoginService, 
    private router: Router, 
    private bp: BreakpointObserver,
    public themeService: ThemeService
  ) {
    this.isHandset$= this.bp.observe([Breakpoints.Handset, Breakpoints.Tablet])
    .pipe(
      map(r=>r.matches)
    )
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

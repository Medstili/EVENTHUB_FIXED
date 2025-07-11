import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../services/authService/login.service';
import { map, Observable, of } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatListModule }       from '@angular/material/list';
import { MatButtonModule }     from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-admin',
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatTooltipModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  isHandset$: Observable<boolean> = of(false);
  @ViewChild('sidenav') sidenav!: MatSidenav;
  
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

  ngOnInit(): void {
   
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

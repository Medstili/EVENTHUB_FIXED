import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute, NavigationEnd, NavigationStart } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { filter, map } from 'rxjs/operators';
import { OrganizerComponent } from '../../user/organizer/organizer.component';
import { ThemeService } from '../../services/theme.service';
import { LoginService, User } from '../../services/authService/login.service';
import { ResponsiveService } from '../../services/responsive.service';
import { AnimationService } from '../../services/animation.service';
import { Observable } from 'rxjs';
import { MatDivider, MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    OrganizerComponent,
    MatDividerModule
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  animations: [
    AnimationService.fadeInUp,
    AnimationService.sidebarSlide,
    AnimationService.staggerFadeIn
  ]
})
export class MainLayoutComponent implements OnInit {
  // Layout state
  showMainLayout = true;
  isMobileMenuOpen = false;
  isUserMenuOpen = false;
  
  // Theme state
  isDarkMode = false;
  
  // User state
  user: User | null = null;

  // Responsive observables
  isHandset$: Observable<boolean>;

  // Navigation state
  navState: 'closed' | 'open' = 'closed';

  constructor(
    private router: Router, 
    private activatedRoute: ActivatedRoute,
    public themeService: ThemeService,
    public loginService: LoginService,
    private responsiveService: ResponsiveService
  ) {
    // Initialize theme
    this.isDarkMode = this.themeService.isDarkMode();
    
    // Initialize responsive observables
    this.isHandset$ = this.responsiveService.isHandset$;
    
    // Subscribe to theme changes
    this.themeService.currentTheme$.subscribe(theme => {
      this.isDarkMode = theme === 'dark';
    });
    
    // Subscribe to user changes using effect
    effect(() => {
      this.user = this.loginService.user();
    });
  }

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.getChildRoute(this.activatedRoute)),
        map(route => route.snapshot.data['hideToolbar'] || false)
      )
      .subscribe(hideToolbar => {
        this.showMainLayout = !hideToolbar;
      });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        // Close mobile menu on navigation
        this.isMobileMenuOpen = false;
        this.isUserMenuOpen = false;
        this.navState = 'closed';
      }
    });
  }

  // Theme methods
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  // Mobile menu methods
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.isUserMenuOpen = false;
    this.navState = this.isMobileMenuOpen ? 'open' : 'closed';
  }

  // User menu methods
  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    this.isMobileMenuOpen = false;
    this.navState = 'closed';
  }

  // Close mobile menu
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    this.navState = 'closed';
  }

  // Auth methods
  get isLoggedIn(): boolean {
    return this.loginService.isLoggedIn();
  }

  logout(): void {
    this.loginService.logout().subscribe({
      next: () => {
        this.isUserMenuOpen = false;
        this.router.navigate(['/home']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Force logout even if server request fails
        this.isUserMenuOpen = false;
        this.router.navigate(['/home']);
      }
    });
  }

  private getChildRoute(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }
}

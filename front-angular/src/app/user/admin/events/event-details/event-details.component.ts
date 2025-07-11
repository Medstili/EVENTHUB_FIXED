import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { EventService, Event } from '../../../../services/eventService/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { StripeApiService } from '../../../../services/stripeService/stripe-api.service';
import { StripeService } from 'ngx-stripe';
import { LoginService } from '../../../../services/authService/login.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdminService } from '../../../../services/adminService/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResponsiveService, ResponsiveBreakpoints } from '../../../../services/responsive.service';
import { AnimationService } from '../../../../services/animation.service';

@Component({
  selector: 'app-event-details',
  imports: [
    CommonModule,
    MatButtonModule,
    RouterModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.scss',
  animations: [
    AnimationService.fadeIn,
    AnimationService.fadeInUp,
    AnimationService.scaleIn,
    AnimationService.cardHover,
    AnimationService.buttonPress,
    AnimationService.pageTransition,
    AnimationService.fadeInLeft,
    AnimationService.fadeInRight,

  ]
})
export class EventDetailsComponent implements OnInit {
  event?: Event;
  
  // Responsive observables (only used ones)
  isHandset$: Observable<boolean>;
  isTablet$: Observable<boolean>;
  isDesktop$: Observable<boolean>;
  responsiveState$: Observable<ResponsiveBreakpoints>;
  
  // Responsive computed values (only used ones)
  contentLayout$: Observable<string>;
  heroHeight$: Observable<string>;
  titleFontSize$: Observable<string>;
  containerPadding$: Observable<string>;
  
  // Animation states
  isLoading: boolean = false;
  fadeIn = false;
  cardHoverState = 'normal';
  buttonPressState = 'normal';

  constructor(
    private adminService: AdminService,
    public router: ActivatedRoute,
    private route: Router,
    private stripeApiService: StripeApiService,
    private stripeService: StripeService,
    private loginService: LoginService,
    private responsiveService: ResponsiveService,
    private animationService: AnimationService,
    private location: Location,
    private snackBar: MatSnackBar
  ) {
    // Initialize responsive observables (only used ones)
    this.isHandset$ = this.responsiveService.isHandset$;
    this.isTablet$ = this.responsiveService.isTablet$;
    this.isDesktop$ = this.responsiveService.isDesktop$;
    this.responsiveState$ = this.responsiveService.responsiveState$;
    this.containerPadding$ = this.responsiveService.getContainerPadding();
    
    // Compute responsive values (only used ones)
    this.contentLayout$ = this.responsiveState$.pipe(
      map(state => state.isHandset ? 'column' : 'row')
    );
    
    this.heroHeight$ = this.responsiveState$.pipe(
      map(state => state.isHandset ? '280px' : state.isTablet ? '320px' : '400px')
    );
    
    this.titleFontSize$ = this.responsiveState$.pipe(
      map(state => state.isHandset ? '1.8rem' : state.isTablet ? '2.2rem' : '2.5rem')
    );
  }

  ngOnInit() {
    const id = Number(this.router.snapshot.paramMap.get('id'));
    if (!id || isNaN(id)) {
      this.openSnackBar('Invalid event ID');
      this.route.navigate(['/admin-profile/admin-events']);
      return;
    }

    this.adminService.getEventById(id).subscribe({
      next: (event) => {
        this.event = event;
        setTimeout(() => this.fadeIn = true, 100);
      },
      error: (err) => {
        this.openSnackBar('Error loading event details');
        this.route.navigate(['/admin-profile/admin-events']);
      }
    });
  }

  // Animation event handlers
  onCardMouseEnter() {
    this.cardHoverState = 'hovered';
  }

  onCardMouseLeave() {
    this.cardHoverState = 'normal';
  }

  onButtonPress() {
    this.buttonPressState = 'pressed';
    setTimeout(() => this.buttonPressState = 'normal', 100);
  }

  deleteEvent(id: number) {
    if (confirm('Are you sure you want to delete this event?')) {
      this.adminService.deleteEvent(id).subscribe({
        next: () => {
          this.openSnackBar('Event deleted successfully');
          this.route.navigate(['/admin-profile/admin-events']);
        },
        error: (err) => {
          this.openSnackBar('Error deleting event');
        }
      });
    }
  }

  getTicket() {
    if (!this.loginService.isLoggedIn()) {
      this.route.navigate(['/login'], { queryParams: { returnUrl: this.route.url } });
      return;
    }

    this.isLoading = true;
    this.stripeApiService.createCheckoutSession(this.event!.id)
      .subscribe({
        next: ({ id: sessionId }) => {
          this.stripeService.redirectToCheckout({ sessionId })
            .subscribe(result => {
              this.isLoading = false;
              if (result.error) {
                console.error('Stripe checkout failed:', result.error.message);
              }
            });
        },
        error: (err) => {
          this.isLoading = false;
          this.openSnackBar('Error creating checkout session');
        }
      });
  }

  goBack() {
    this.location.back();
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }
}









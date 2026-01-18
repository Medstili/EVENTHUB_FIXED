import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Event } from '../../../../services/eventService/event.service';
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
import { AdminService } from '../../../../services/adminService/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResponsiveService } from '../../../../services/responsive.service';
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
  isHandset$: Observable<boolean>;

  // Animation states
  isLoading: boolean = false;


  constructor(
    private adminService: AdminService,
    public router: ActivatedRoute,
    private route: Router,
    private stripeApiService: StripeApiService,
    private stripeService: StripeService,
    private loginService: LoginService,
    private responsiveService: ResponsiveService,
    private location: Location,
    private snackBar: MatSnackBar
  ) {
    this.isHandset$ = this.responsiveService.isHandset$;

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
      },
      error: (err) => {
        this.openSnackBar('Error loading event details');
        this.route.navigate(['/admin-profile/admin-events']);
      }
    });
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
        // next: ({ id: sessionId }) => {
        //   this.stripeService.redirectToCheckout({ sessionId })
        //     .subscribe(result => {
        //       this.isLoading = false;
        //       if (result.error) {
        //         console.error('Stripe checkout failed:', result.error.message);
        //       }
        //     });
        // },
        next: ({ url }) => {
          this.isLoading = false;
          if (!url) {
            this.openSnackBar('Stripe session URL not found');
            return;
          }
          window.location.href = url;
        },
        error: (err) => {
          this.isLoading = false;
          console.log("error", err);
          this.openSnackBar('Error creating checkout session');
        }
      });
  }

  goBack() {
    this.location.back();
  }

  get canRegister(): boolean {
      return !this.isOutdated && !this.isSoldOut
  }
  get isSoldOut(): boolean {
    const sold = this.event?.current_registrations ?? 0;
    const capacity = this.event?.capacity ?? 0;
    const soldout = capacity > 0 && sold >= capacity;
    return soldout ;
  }
  get isOutdated(): boolean {
    if (!this.event) return false;
    const eventDate = new Date(this.event.date);
    const todayDate = new Date();
    const outdated = eventDate < todayDate;
    console.log(outdated);
    
     return outdated;
  }
  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }
}









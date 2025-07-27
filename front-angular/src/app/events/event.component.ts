import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Event, EventService } from '../services/eventService/event.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { StripeApiService } from '../services/stripeService/stripe-api.service';
import { StripeService } from 'ngx-stripe';
import { LoginService } from '../services/authService/login.service';
import { ResponsiveService } from '../services/responsive.service';
import { AnimationService } from '../services/animation.service';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-event',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.scss'],
  animations: [
    AnimationService.fadeInUp,
    AnimationService.slideInUp,
    AnimationService.scaleIn
  ]
})
export class EventComponent implements OnInit {
  event?: Event;
  isHandset$: Observable<boolean>;

  constructor(
    private eventService: EventService,
    public router: ActivatedRoute, 
    private route: Router,
    private stripeApiService: StripeApiService,
    private stripeService: StripeService,
    private loginService: LoginService,
    private responsiveService: ResponsiveService,
    private snackBar: MatSnackBar
  ) {
    this.isHandset$ = this.responsiveService.isHandset$;
  }

  ngOnInit() {
    const id = Number(this.router.snapshot.paramMap.get('id'));
    this.eventService.guessGetById(id).subscribe({
      next: evt => {
        this.event = evt;
      },
      error: err => console.error('getById error:', err)
    });
  }

  getTicket() {
    if(!this.loginService.isLoggedIn()){
      this.route.navigate(['/login'], { queryParams: { returnUrl: this.route.url } });     
    } else {
      this.stripeApiService.createCheckoutSession(this.event!.id)
        .subscribe({
          next: ({ id: sessionId }) => {
            this.stripeService.redirectToCheckout({ sessionId })
              .subscribe(result => {
                if (result.error) {
                  console.error('stripe failed', result.error.message);
                  this.openSnackBar("stripe failed, try again later");
                }
              });
          },
          error: err => {
            console.log(err);
            this.openSnackBar("the event is sold out !! , next time ");
          }
        });
    }
  }
  get canRegister(): boolean {
      if (!this.event || this.event.current_registrations == null || this.event.capacity == null || !this.event.date) {
        return false;
      }
      const eventDate = new Date(this.event.date);
      const todayDate = new Date();
      return (this.event.current_registrations < this.event.capacity) && (eventDate >= todayDate);
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

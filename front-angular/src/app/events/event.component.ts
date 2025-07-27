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
    private responsiveService: ResponsiveService
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
        .subscribe(({ id: sessionId }) => {
          this.stripeService.redirectToCheckout({ sessionId })
            .subscribe(result => {
              if (result.error) {
                console.error('stripe failed',result.error.message);
              }
            });
        });
    }
  }


}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { Observable } from 'rxjs';
import { TicketService, Ticket } from '../../../services/ticketService/tickets.service';
import { ResponsiveService } from '../../../services/responsive.service';
import { AnimationService } from '../../../services/animation.service';

@Component({
  selector: 'app-my-tickets',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './my-tickets.component.html',
  styleUrl: './my-tickets.component.scss',
  animations: [
    AnimationService.fadeInUp,
    AnimationService.slideInLeft,
    AnimationService.staggerFadeIn,
    AnimationService.scaleIn,
    AnimationService.cardHover
  ]
})
export class MyTicketsComponent implements OnInit {
  reservations: Ticket[] = [];
  loading = false;
  isHandset$: Observable<boolean>;
  isTablet$: Observable<boolean>;
  isDesktop$: Observable<boolean>;
  hoveredCardId: number | null = null;

  constructor(
    private ticketService: TicketService,
    private snackBar: MatSnackBar,
    private location: Location,
    public responsiveService: ResponsiveService
  ) {
    this.isHandset$ = this.responsiveService.isHandset$;
    this.isTablet$ = this.responsiveService.isTablet$;
    this.isDesktop$ = this.responsiveService.isDesktop$;
  }

  ngOnInit(): void {
    this.loadReservations();
  }

  private loadReservations(): void {
    this.loading = true;
    this.ticketService.getTickets().subscribe({
      next: (list) => {
        this.reservations = list;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.openSnackBar('Error loading tickets');
      }
    });
  }

  trackByTicketId(index: number, ticket: Ticket): number {
    return ticket.id;
  }

  onCardHover(ticketId: number | null): void {
    this.hoveredCardId = ticketId;
  }

  openSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }

  goBack(): void {
    this.location.back();
  }
}

import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TicketService, Ticket } from '../../../services/ticketService/tickets.service';
import { MatButtonModule } from '@angular/material/button';
import { Observable } from 'rxjs';
import { ResponsiveService } from '../../../services/responsive.service';
import { AnimationService } from '../../../services/animation.service';

@Component({
  selector: 'app-participant-reservations',
  imports: [
    MatCardModule,
    MatIconModule,
    CommonModule,
    MatButtonModule,
    RouterModule
  ],
  animations: [
    AnimationService.pageTransition,
    AnimationService.fadeInUp,
    AnimationService.staggerFadeIn,
    AnimationService.cardHover,
    AnimationService.buttonPress
  ],
  templateUrl: './participant-tickets.component.html',
  styleUrls: ['./participant-tickets.component.scss']
})
export class ParticipantReservationsComponent implements OnInit {
  private svc = inject(TicketService);
  private snackBar = inject(MatSnackBar);
  private responsiveService = inject(ResponsiveService);

  reservations: Ticket[] = [];
  loading = false;

  // Responsive observables
  isHandset$: Observable<boolean>;
  cardLayout$: Observable<'compact' | 'comfortable'>;

  constructor() {
    // Initialize responsive observables
    this.isHandset$ = this.responsiveService.isHandset$;
    this.cardLayout$ = this.responsiveService.getCardLayout();
  }

  ngOnInit(): void {
    this.loadTickets();
  }

  private loadTickets(): void {
    this.loading = true;
    this.svc.getTickets().subscribe({
      next: (list: any) => {
        this.reservations = list;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.openSnackBar('Error loading tickets');
      }
    });
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  // TrackBy function for performance optimization
  trackByTicketId(index: number, ticket: Ticket): number {
    return ticket.id;
  }

  // Animation methods
  onCardHover(event: any, isHovered: boolean) {
    event.target.style.transform = isHovered ? 'translateY(-4px)' : 'translateY(0)';
  }

  onButtonPress(event: any, isPressed: boolean) {
    event.target.style.transform = isPressed ? 'scale(0.95)' : 'scale(1)';
  }
}



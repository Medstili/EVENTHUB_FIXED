import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { EventService } from '../services/eventService/event.service';
import { TicketService } from '../services/ticketService/tickets.service';
import { UserService } from '../services/guestService/user.service';
import { ResponsiveService } from '../services/responsive.service';
import { AnimationService } from '../services/animation.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, MatIconModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  animations: [
    AnimationService.fadeInUp,
    AnimationService.staggerFadeIn,
    AnimationService.cardHover,
    AnimationService.pulse
  ]
})
export class AboutComponent implements OnInit {
  totalEvents = 0;
  totalTickets = 0;
  totalOrganizers = 0;

  // Responsive observables
  isHandset$;


  constructor(
    private eventService: EventService, 
    private ticketService: TicketService, 
    private userService: UserService,
    private responsiveService: ResponsiveService
  ) {
    // Initialize responsive observables after constructor
    this.isHandset$ = this.responsiveService.isHandset$;

  }

  ngOnInit() {
    this.loadStats();
  }

  private loadStats() {
    this.eventService.getTotalEvents().subscribe({
      next: (events) => {
        this.totalEvents = events;
        console.log('total Events:', this.totalEvents);
      },
      error: (err) => {
        console.error('Error fetching events:', err);
      }
    });

    this.ticketService.getTotalTickets().subscribe({
      next: (tickets) => {
        this.totalTickets = tickets;
        console.log('totalTickets:', this.totalTickets);
      },
      error: (err) => {
        console.error('Error fetching tickets:', err);
      }
    });

    this.userService.getOrganizersCount().subscribe({
      next: (organizers) => {
        this.totalOrganizers = organizers;
        console.log('totalOrganizers:', this.totalOrganizers);
      },
      error: (err) => {
        console.error('Error fetching organizers:', err);
      }
    });
  }
}

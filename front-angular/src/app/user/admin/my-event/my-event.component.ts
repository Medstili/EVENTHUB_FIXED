import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Event } from '../../../services/eventService/event.service';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable } from 'rxjs';
import { AdminService } from '../../../services/adminService/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResponsiveService } from '../../../services/responsive.service';
import { AnimationService } from '../../../services/animation.service';

@Component({
  selector: 'app-my-event',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './my-event.component.html',
  styleUrls: ['./my-event.component.scss'],
  animations: [
    AnimationService.fadeInUp,
    AnimationService.slideInLeft,
    AnimationService.staggerFadeIn,
    AnimationService.scaleIn,
    AnimationService.cardHover
  ]
})
export class MyEventComponent implements OnInit {
  events: Event[] = [];
  isHandset$: Observable<boolean>;
  isTablet$: Observable<boolean>;
  isMobile$: Observable<boolean>;
  isDesktop$: Observable<boolean>;
  isLoading = false;
  today = new Date();

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    public responsiveService: ResponsiveService
  ) {
    this.isHandset$ = this.responsiveService.isHandset$;
    this.isTablet$ = this.responsiveService.isTablet$;
    this.isMobile$ = this.responsiveService.isMobile$;
    this.isDesktop$ = this.responsiveService.isDesktop$;
  }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.adminService.getUserEvents().subscribe({
      next: (events: any) => {
        this.events = events || [];
        this.isLoading = false;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.openSnackBar('Error loading events');
      }
    });
  }

  onDelete(id: number): void {
    if (confirm("Are you sure you want to delete this event?")) {
      this.adminService.deleteEvent(id).subscribe({
        next: () => {
          this.loadEvents();
          this.openSnackBar('Event deleted successfully');
        },
        error: (err: any) => {
          this.openSnackBar('Error deleting event');
        }
      });
    }
  }

  openSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }

  trackByEventId(index: number, event: any): number {
    return event.id || index;
  }

  getEventStatus(event: Event): { status: string; class: string } {
    const eventDate = new Date(event.date);
    if (eventDate < this.today) {
      return { status: 'Past', class: 'past' };
    } else if (eventDate.getTime() - this.today.getTime() <= 7 * 24 * 60 * 60 * 1000) {
      return { status: 'Upcoming', class: 'upcoming' };
    } else {
      return { status: 'Active', class: 'active' };
    }
  }

  get activeEventsCount(): number {
    return this.events.filter(e => new Date(e.date) >= this.today).length;
  }

  get totalTicketsSold(): number {
    return this.events.reduce((sum, e) => sum + (e.totalTicketsSold || 0), 0);
  }
}

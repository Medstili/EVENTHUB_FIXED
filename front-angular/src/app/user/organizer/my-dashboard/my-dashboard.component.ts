import { Component, OnInit } from '@angular/core';
import { EventsCount } from '../../../services/guestService/user.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Event } from '../../../services/eventService/event.service';
import { TopSalesChartComponent } from '../../../charts/top-sales-chart/top-sales-chart.component';
import { RevenueChartComponentComponent } from '../../../charts/revenue-chart-component/revenue-chart-component.component';
import { map, Observable } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { OrganizerService } from '../../../services/organizerServer/organizer.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AnimationService } from '../../../services/animation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    RouterModule,
    MatIconModule,
    CommonModule,
    RevenueChartComponentComponent,
    TopSalesChartComponent,
    MatProgressSpinner
  ],
  templateUrl: "./my-dashboard.component.html",
  styleUrls: ["./my-dashboard.component.scss"],
  animations: [
    AnimationService.fadeInUp,
    AnimationService.slideInLeft,
    AnimationService.staggerFadeIn,
    AnimationService.scaleIn,
    AnimationService.cardHover
  ]
})
export class MyDashboardComponent implements OnInit {

  eventsCount: EventsCount | undefined;
  upcomingEvents: {count:number, events: Event[]} = {count:0, events:[]};
  pastEvents: {count:number, events: Event[]} = {count:0, events:[]};
  totalTicketsSold: number | undefined;
  totalRevenue: number | undefined;
  mostTicketSales: any[] = [];
  revenueData:{ name: string; series: { name: string; value: number }[] }[] = [];
  recentEvents: any[] = [];
  isHandset$: Observable<boolean>;

  today = new Date();

  // Loading states
  isLoadingRecentEvents = true;
  isLoadingUpcomingEvents = true;
  isLoadingPastEvents = true;
  isLoadingStats = true;

  // Responsive chart properties
  revenueChartView: [number, number] = [500, 400];
  topSalesChartView: [number, number] = [900, 300];

  constructor(private organizerService: OrganizerService, private bp: BreakpointObserver) {
    this.isHandset$ = this.bp.observe([Breakpoints.Handset, Breakpoints.Tablet])
      .pipe(map(r => r.matches));
  }

  ngOnInit(): void {
    this.loadDashboardData();
    this.isHandset$.subscribe(isHandset => {
      if (isHandset) {
        // Mobile/Handset dimensions
        this.revenueChartView = [300, 250];
        this.topSalesChartView = [300, 250];

      } else {
        // Desktop dimensions
        this.revenueChartView = [500, 400];
        this.topSalesChartView = [900, 300];

      }
    });
  }

  loadDashboardData(): void {
    this.organizerService.getOrganizerEventsCount().subscribe({ 
      next: (data) => {
        this.eventsCount = data;
        this.isLoadingStats = false;
      },
      error: (err) => {
        console.error('Error loading events:', err);
        this.isLoadingStats = false;
      }
    });

    this.organizerService.getUpcomingEvents().subscribe({
      next: (data) => {
        this.upcomingEvents = data;
        this.isLoadingUpcomingEvents = false;
      },
      error: (err) => {
        console.error('Error loading upcoming events:', err);
        this.isLoadingUpcomingEvents = false;
      }
    });

    this.organizerService.getPastEvents().subscribe({
      next: (data) => {
        this.pastEvents = data;
        this.isLoadingPastEvents = false;
      },
      error: (err) => {
        console.error('Error loading past events:', err);
        this.isLoadingPastEvents = false;
      }
    });

    this.organizerService.getTotalTicketsSold().subscribe({
      next: (data) => {
        this.totalTicketsSold = data;
      },
      error: (err) => console.error('Error loading total tickets sold:', err)
    });

    this.organizerService.getMostTicketSales().subscribe({
      next: (data) => {
        this.mostTicketSales = data;
      },
      error: (err) => console.error('Error loading most ticket sales:', err)
    });

    // Load enhanced dashboard stats
    this.organizerService.getDashboardStats().subscribe({
      next: (data) => {
        if (data.totalEvents !== undefined) {
          this.eventsCount = {
            total: data.totalEvents,
            public: 0,
            private: 0
          };
        }
        if (data.totalRevenue !== undefined) {
          this.totalRevenue = data.totalRevenue;
        }
        if (data.recentEvents !== undefined) {
          this.recentEvents = data.recentEvents;
        }
        this.isLoadingRecentEvents = false;
      },
      error: (err) => {
        console.error('Error loading enhanced dashboard stats:', err);
        this.isLoadingRecentEvents = false;
      }
    });

    // Load ticket statistics
    this.organizerService.getTicketStats().subscribe({
      next: (data) => {
        if (data.totalTicketsSold !== undefined) {
          this.totalTicketsSold = data.totalTicketsSold;
        }
        if (data.totalRevenue !== undefined) {
          this.totalRevenue = data.totalRevenue;
        }
      },
      error: (err) => console.error('Error loading ticket stats:', err)
    });

    // Load revenue overview data
    this.organizerService.getRevenueOverview().subscribe({
      next: (data) => {
        this.revenueData = data;
      },
      error: (err) => console.error('Error loading revenue overview data:', err)
    });
  }

  trackByEventId(index: number, event: any): number {
    return event.id || index;
  }
}


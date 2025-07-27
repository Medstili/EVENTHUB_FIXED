import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AdminService } from '../../../services/adminService/admin.service';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RevenueChartComponentComponent } from '../../../charts/revenue-chart-component/revenue-chart-component.component';
import { PieChartComponent } from '../../../charts/pie-chart/pie-chart.component';
import { DoughnutChartComponent } from '../../../charts/doughnut-chart/doughnut-chart.component';
import { TopSalesChartComponent } from '../../../charts/top-sales-chart/top-sales-chart.component';
import { LineChartComponent } from '../../../charts/line-chart/line-chart.component';
import { UserGrowthChartComponent } from '../../../charts/user-growth-chart/user-growth-chart.component';
import { ResponsiveService } from '../../../services/responsive.service';
import { AnimationService } from '../../../services/animation.service';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule,
    MatIconModule,
    RevenueChartComponentComponent,
    PieChartComponent,
    DoughnutChartComponent,
    TopSalesChartComponent,
    LineChartComponent,
    UserGrowthChartComponent
  ],
  animations: [
    AnimationService.fadeInUp,
    AnimationService.staggerFadeIn,
    AnimationService.cardHover,
    AnimationService.scaleIn,
    AnimationService.pageTransition,
    AnimationService.listItemEnter,
    AnimationService.buttonPress
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  // Dashboard data properties
  totalEvents = 0;
  activeEvents = 0;
  totalParticipants = 0;
  totalRevenue = 0;
  recentEvents: any[] = [];
  topCategories: any[] = [];
  recentActivity: any[] = [];
  userGrowthData: any[] = [];
  ticketSalesByCategory: any[] = [];
  revenueOverviewData: any[] = [];
  topEvents: any[] = [];
  pieData: any[] = [];
  doughnutData: any[] = [];
  lineChartData: any[] = [];
  chartPeriod = 'month';

  // Loading states
  isLoadingStats = true;
  isLoadingRecentEvents = true;
  isLoadingRecentActivity = true;
  isLoadingTopCategories = true;
  isLoadingTicketSales = true;
  isLoadingRevenueData = true;
  isLoadingUserGrowth = true;
  isLoadingPieData = true;
  isLoadingDoughnutData = true;
  isLoadingTopEvents = true;
  isLoadingLineData = true;

  // Responsive property
  isHandset$: Observable<boolean>;
  
  // Chart properties
  chartWidth = 600;
  chartHeight = 400;


  constructor(
    private srv: AdminService, 
    private responsiveService: ResponsiveService
  ){
    this.isHandset$ = this.responsiveService.isHandset$;
  }

  ngOnInit(): void {
    this.loadDashboardData();
    this.setupResponsiveChartProperties();
  }

  private setupResponsiveChartProperties(): void {
    this.isHandset$.subscribe((isMobile) => {
      if (isMobile) {
        this.chartWidth = 300;
        this.chartHeight = 300;
      } else {
        this.chartWidth = 550;
        this.chartHeight = 400;
      }
    });
  }

  loadDashboardData(): void {
    // Load enhanced dashboard data (includes basic stats)
    this.srv.getDashboardStats().subscribe({
      next: (data) => {
        this.totalEvents = data.totalEvents;
        this.activeEvents = data.activeEvents;
        this.totalParticipants = data.totalUsers;
        this.totalRevenue = data.totalRevenue;
        this.recentEvents = data.recentEvents;
        this.topCategories = data.topCategories;
        this.isLoadingStats = false;
        this.isLoadingRecentEvents = false;
        this.isLoadingTopCategories = false;
      },
      error: (err) => {
        console.error('Error loading dashboard stats:', err);
        this.isLoadingStats = false;
        this.isLoadingRecentEvents = false;
        this.isLoadingTopCategories = false;
      }
    });

    // Load chart data
    this.srv.getRecentActivity().subscribe({
      next: (data) => {
        this.recentActivity = data;
        this.isLoadingRecentActivity = false;
      },
      error: (err) => {
        console.error('Error loading recent activity:', err);
        this.isLoadingRecentActivity = false;
      }
    });

    this.srv.getUserDistribution().subscribe({
      next: (data) => {
        this.pieData = data;
        this.isLoadingPieData = false;
      },
      error: (err) => {
        console.error('Error loading user distribution:', err);
        this.isLoadingPieData = false;
      }
    });

    this.srv.getTicketSalesByCategory().subscribe({
      next: (data) => {
        this.ticketSalesByCategory = data;
        this.isLoadingTicketSales = false;
      },
      error: (err) => {
        console.error('Error loading ticket sales by category:', err);
        this.isLoadingTicketSales = false;
      }
    });

    this.srv.getRevenueOverview().subscribe({
      next: (data) => {
        this.revenueOverviewData = data;
        this.isLoadingRevenueData = false;
      },
      error: (err) => {
        console.error('Error loading revenue overview:', err);
        this.isLoadingRevenueData = false;
      }
    });

    this.srv.getUserGrowth().subscribe({
      next: (data) => {
        this.userGrowthData = data;
        this.isLoadingUserGrowth = false;
      },
      error: (err) => {
        console.error('Error loading user growth:', err);
        this.isLoadingUserGrowth = false;
      }
    });

    this.srv.get_All_Pb_Pr_Events().subscribe({
      next: (data) => {
        this.doughnutData = data;
        this.isLoadingDoughnutData = false;
      },
      error: (err) => {
        console.error('Error loading event visibility:', err);
        this.isLoadingDoughnutData = false;
      }
    });

    this.srv.getTopEvents().subscribe({
      next: (data) => {
        this.topEvents = data;
        this.isLoadingTopEvents = false;
      },
      error: (err) => {
        console.error('Error loading top events:', err);
        this.isLoadingTopEvents = false;
      }
    });

    this.srv.get_tickets_sold_each_month().subscribe({
      next: (data) => {
        this.lineChartData = data;
        this.isLoadingLineData = false;
      },
      error: (err) => {
        console.error('Error loading monthly tickets:', err);
        this.isLoadingLineData = false;
      }
    });
  }
}

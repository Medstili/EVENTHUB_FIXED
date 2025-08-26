import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Ticket, TicketService } from '../../../../services/ticketService/tickets.service';
import { ResponsiveService } from '../../../../services/responsive.service';
import { AnimationService } from '../../../../services/animation.service';
import { QRCodeComponent } from 'angularx-qrcode';
import { AdminService } from '../../../../services/adminService/admin.service';

@Component({
  selector: 'app-ticket-details',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule,
    QRCodeComponent
  ],
  templateUrl: './ticket-details.component.html',
  styleUrl: './ticket-details.component.scss',
  animations: [
    AnimationService.fadeInUp,
    AnimationService.slideInLeft,
    AnimationService.scaleIn,
    AnimationService.cardHover,
    AnimationService.staggerFadeIn
  ]
})
export class TicketDetailsComponent implements OnInit {
  ticket!: Ticket;
  isHandset$: Observable<boolean>;

  isloading = false;
  isCancelling = false;

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private adminService: AdminService,
    private location: Location,
    private snackBar: MatSnackBar,
    public responsiveService: ResponsiveService
  ) {
    this.isHandset$ = this.responsiveService.isHandset$;

  }

  ngOnInit(): void {
    const ticketId = Number(this.route.snapshot.paramMap.get('id'));
    this.ticketService.getById(ticketId).subscribe({
      next: (ticket: any) => {
        this.ticket = ticket;
      },
      error: () => {
        this.openSnackBar('Error loading ticket details');
      }
    });
  }

  downloadTicket(): void {
    this.isloading = true;
    this.ticketService.downloadPdf(this.ticket.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ticket-${this.ticket.id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.isloading = false;
        this.openSnackBar('Ticket downloaded successfully');
      },
      error: () => {
        this.isloading = false;
        this.openSnackBar('Failed to download ticket');
      }
    });
  }

  cancelTicket(id: number): void {
    if (!confirm('Are you sure you want to cancel this ticket?')) return;
    this.isCancelling = true;
    this.adminService.cancelTicket(id).subscribe({
      next: () => {
        this.openSnackBar('Ticket cancelled successfully');
        window.location.reload();
        this.isCancelling = false;
      },
      error: () => {
        this.openSnackBar('Cancellation failed, try again!');
        this.isCancelling = false;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  openSnackBar(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }
}

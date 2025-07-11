// ticket-details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Ticket, TicketService } from '../../../services/ticketService/tickets.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { QRCodeComponent } from 'angularx-qrcode';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, Observable } from 'rxjs';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';



@Component({
  selector: 'app-ticket-details',
  templateUrl: './ticket-details.component.html',
  styleUrls: ['./ticket-details.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    RouterModule, 
    QRCodeComponent  ,
    MatProgressSpinner
  ],
  animations:[
    trigger('slideInRight', [
        transition(':enter', [
        style({ opacity: 0, transform: 'translateX(200px)' }),
        animate('600ms 300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
  ]
})
export class TicketDetailsComponent implements OnInit {
  ticket!: Ticket;
  isHandset$ : Observable<boolean>;
  isLoading: boolean = false;


  constructor(
    private route: ActivatedRoute,
    private svc: TicketService,
    private location: Location,
    private bp: BreakpointObserver,
    private snackBar: MatSnackBar
  ) {
    this.isHandset$= this.bp.observe(Breakpoints.Handset)
    .pipe(
      map(
        r=> r.matches
      )
    )
  }

  ngOnInit() {
    const ticketId = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getById(ticketId).subscribe({
      next: (ticket: any) => {
        this.ticket = ticket;
      },
      error: (err: any) => {
        console.error('Error loading ticket details:', err);
        this.openSnackBar('Error loading ticket details');
      }
    });
  }

  downloadTicket() {
    this.isLoading = true;
    this.svc.downloadPdf(this.ticket.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ticket-${this.ticket.id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.isLoading = false;
        this.openSnackBar('Ticket Downloaded Successfully');
      },
      error: (err) => {
        this.isLoading = false;
        this.openSnackBar('Failed to download ticket');
      }
    });
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }

  goBack() {
    this.location.back();
  }
}

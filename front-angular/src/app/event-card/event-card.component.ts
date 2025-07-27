import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Event } from '../services/eventService/event.service';
import { AnimationService } from '../services/animation.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './event-card.component.html',
  styleUrls: ['./event-card.component.scss'],
  animations: [
    AnimationService.fadeInUp,
    AnimationService.cardHover,
    AnimationService.buttonPress
  ]
})
export class EventCardComponent {
  @Input() event!: Event;

  // Animation state properties
  isHovered = false;
  isPressed = false;



  constructor(
    private router: Router
  ) {

  }

  // Animation state helpers
  getCardHoverState(isHovered: boolean): string {
    return isHovered ? 'hovered' : 'normal';
  }

  getButtonPressState(isPressed: boolean): string {
    return isPressed ? 'pressed' : 'normal';
  }

  // Button press handlers
  onButtonPress(isPressed: boolean) {
    this.isPressed = isPressed;
  }

  // Event handlers
  onViewDetails() {
    // Navigate to event details page
    this.router.navigate(['/events', this.event.id]);
  }

  // Utility methods
  private getEventStatus(): string {
    const eventDate = new Date(this.event.date);
    const now = new Date();
    const timeDiff = eventDate.getTime() - now.getTime();
    
    if (eventDate < now) {
      return 'outDated';
    } else if (timeDiff < 24 * 60 * 60 * 1000) {
      return 'upcoming';
    } else {
      return 'future';
    }
  }

  // getEventStatusColor(): string {
  //   const status = this.getEventStatus();
  //   switch (status) {
  //     case 'outDated': return 'var(--primary-50)';
  //     case 'upcoming': return 'var(--warning-color)';
  //     case 'future': return 'var(--success-color)';
  //     default: return 'var(--text-secondary)';
  //   }
  // }
  getEventStatusBgColor(): string {
    const status = this.getEventStatus();
    switch (status) {
      case 'outDated': return 'var(--warning-500)';
      case 'upcoming': return 'var(--primary-600)';
      case 'future': return 'var(--success-600)';
      default: return 'var(--neutral-500)';
    }
  }

  getEventStatusText(): string {
    const status = this.getEventStatus();
    switch (status) {
      case 'outDated': return 'outDated';
      case 'upcoming': return 'Upcoming';
      case 'future': return 'Future Event';
      default: return 'Unknown';
    }
  }

  formatPrice(price: string): string {
    const numPrice = parseFloat(price);
    if (numPrice === 0) {
      return 'Free';
    }
    return `$${numPrice.toFixed(2)}`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(time: string): string {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  getImageUrl(): string {
    return this.event.image_url;
  }

  getAvailabilityPercentage(): number {
    if (this.event.capacity === 0) return 0;
    const sold = this.event.current_registrations || 0;
    return Math.round((sold / this.event.capacity) * 100);
  }

  getAvailabilityColor(): string {
    const percentage = this.getAvailabilityPercentage();
    if (percentage >= 90) return 'var(--error-color)';
    if (percentage >= 70) return 'var(--warning-color)';
    return 'var(--success-color)';
  }

  get isSoldOut(): boolean {
    const sold = this.event.current_registrations ?? 0;
    return this.event.capacity > 0 && sold >= this.event.capacity;
  }

  get isOutdated(): boolean {
    if (!this.event) return false;
    const eventDate = new Date(this.event.date);
    const todayDate = new Date();
    const outdated = eventDate > todayDate;
    //  return outdated;
    return true;

  }
}
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponsiveService } from '../../../services/responsive.service';
import { AnimationService } from '../../../services/animation.service';
import { ContactUsServiceService} from '../../../services/contactUsService/contact-us-service.service';
import { MessageStats, Conversation, ConversationService } from '../../../services/conversationService/conversation.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.scss'],
  animations: [
    AnimationService.fadeInUp,
    AnimationService.staggerFadeIn,
    AnimationService.cardHover
  ]
})
export class ConversationsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Services
  responsive = inject(ResponsiveService);
  fb = inject(FormBuilder);
  snackBar = inject(MatSnackBar);
  contactService = inject(ContactUsServiceService);
  router = inject(Router);
  conversationService = inject(ConversationService);

  // Data
  conversations: Conversation[] = [];
  stats: MessageStats | null = null;
  loading = false;
  statsLoading = false;
  loadingMore = false;

  // Pagination
  currentPage = 1;
  totalItems = 0;
  pageSize = 10;

  // Filters
  filterForm: FormGroup;
  selectedStatus = 'all';
  searchTerm = '';
  hasMore = false;

  // Responsive
  isHandset$ = this.responsive.isHandset$;


  // Status options
  statusOptions = [
    { value: 'all', label: 'All Messages', color: 'primary' },
    { value: 'unread', label: 'Unread', color: 'warn' },
    { value: 'read', label: 'Read', color: 'accent' },
    { value: 'solved', label: 'Solved', color: 'primary' },
    { value: 'unsolved', label: 'Not Solved', color: 'warn' }
  ];

  constructor() {
    this.filterForm = this.fb.group({
      status: ['all'],
      search: ['']
    });
  }

  ngOnInit() {
    this.refresh();
    this.setupFilterListeners();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilterListeners() {
    // Search debounce
    this.filterForm.get('search')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(search => {
        this.searchTerm = search;
        this.currentPage = 1;
        this.loadConversations(false); // Always replace on filter change
      });

    // Status filter
    this.filterForm.get('status')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(status => {
        this.selectedStatus = status;
        this.currentPage = 1;
        this.loadConversations(false); // Always replace on filter change
      });
  }

  loadConversations(loadMore: boolean = false) {
    if (loadMore) {
      this.loadingMore = true;
    } else {
      this.loading = true;
    }
    const filters: any = {};
    // Map status to API params
    if (this.selectedStatus === 'solved' || this.selectedStatus === 'unsolved') {
      filters.status = this.selectedStatus;
    } else if (this.selectedStatus === 'read' || this.selectedStatus === 'unread') {
      filters.status = this.selectedStatus;
    }
    if (this.searchTerm) {
      filters.email = this.searchTerm;
    }
    filters.per_page = this.pageSize; // Use per_page to match backend
    const page = this.currentPage;
    this.conversationService.getConversations(page, filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (loadMore) {
            this.conversations = [...this.conversations, ...response.data];
          } else {
            this.conversations = response.data;
          }
          this.totalItems = response.total;
          this.hasMore = response.current_page < response.last_page;
          if (loadMore) {
            this.loadingMore = false;
          } else {
            this.loading = false;
          }
        },
        error: (error) => {
          this.openSnackBar('Failed to load conversations');
          if (loadMore) {
            this.loadingMore = false;
          } else {
            this.loading = false;
          }
        }
      });
  }

  refresh() {
    this.loadStats();
    this.loadConversations();
  }

  loadStats() {
    this.statsLoading = true;
    this.conversationService.getConversationStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats) => {
          this.stats = stats;
          this.statsLoading = false;
        },
        error: () => {
          this.openSnackBar('Failed to load statistics');
          this.statsLoading = false;
        }
      });
  }

  onLoadMore() {
    if (this.hasMore && !this.loading) {
      this.currentPage++;
      this.loadConversations(true);
    }
  }

  getStatusColor(status: string): string {
    console.log(status);
    
    switch (status) {
      case 'solved': return 'primary';
      case 'unsolved': return 'warn';
      default: return 'primary';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'unread': return 'mark_email_unread';
      case 'read': return 'mark_email_read';
      case 'solved': return 'task_alt';
      case 'unsolved': return 'pending';
      default: return 'email';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  truncateText(text: string, maxLength: number = 100): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  trackByConversationId(index: number, conversation: Conversation): number {
    return conversation.id;
  }

  onViewConversation(conversation: Conversation) {
    // Placeholder for navigation to chat page
    this.router.navigate(['admin-profile', 'admin-conversations', 'chat', conversation.id]);
  }

  clearStatus() {
    this.filterForm.get('status')?.setValue('all');
  }
  clearSearch() {
    this.filterForm.get('search')?.setValue('');
  }
  resetFilters() {
    this.filterForm.get('status')?.setValue('all');
    this.filterForm.get('search')?.setValue('');
  }

  hasUnreadUserMessage(conversation: Conversation): boolean {
    return conversation.messages?.some(m => m.sender_type === 'user' && !m.is_read) ?? false;
  }

  getStatusLabel(status: string): string {
    const found = this.statusOptions.find(opt => opt.value === status);
    return found ? found.label : '';
  }

  isUnread(conversation: Conversation): boolean {
    return this.hasUnreadUserMessage(conversation);
  }
}

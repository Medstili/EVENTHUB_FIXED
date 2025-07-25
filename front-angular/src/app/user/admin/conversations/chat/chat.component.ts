import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { ResponsiveService } from '../../../../services/responsive.service';
import { AnimationService } from '../../../../services/animation.service';
import { ConversationService, Message } from '../../../../services/conversationService/conversation.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule, MatIconModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  animations: [
    AnimationService.fadeIn,
    AnimationService.fadeInUp
  ]
})
export class ChatComponent implements OnInit {
  adminAvatar = 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff';
  userAvatar = 'https://ui-avatars.com/api/?name=User&background=F4B400&color=fff';
  messages: Array<{ sender: string; text: string; time: string; avatar: string }>= [];
  newMessage = '';
  responsiveFontSize = '15px';
  responsiveBubbleWidth = '70vw';
  conversationId: number = 0;
  isSending = false;
  errorMessage = '';
  guest_name: string ='';
  guest_email: string ='';
  isMobile = false; // Add this property

  constructor(
    public responsive: ResponsiveService,
    private route: ActivatedRoute,
    private location: Location,
    private conversationService: ConversationService,
    private snackBar: MatSnackBar
  ) {
    this.responsive.getResponsiveFontSize().subscribe(size => this.responsiveFontSize = size);
    this.responsive.isMobile$.subscribe(isMobile => {
      this.responsiveBubbleWidth = isMobile ? '90vw' : '70vw';
      this.isMobile = isMobile;
    });
    
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params: any) => {
      const id = params.get('id');
      if (id) {
        this.conversationId = +id;
      }
      this.loadConversationMessages(this.conversationId);
    });
  }

  loadConversationMessages(conversationId: number) {
    this.conversationService.getConversationMessages(conversationId).subscribe(conversation => {
      this.guest_name = conversation.guest_name;
      this.guest_email = conversation.guest_email;
      this.messages = (conversation.messages || []).map((msg: Message) => ({
        sender: msg.sender_type === 'admin' ? 'Admin' : 'User',
        text: msg.body,
        time: msg.created_at ? msg.created_at.substring(11, 16) : '',
        avatar: msg.sender_type === 'admin' ? this.adminAvatar : this.userAvatar
      }));
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  goBack() {
    this.location.back();
  }

  markAsSolved() {
    this.conversationService.updateStatus(this.conversationId, 'solved').subscribe({
      next: (res) => {
        this.openSnackBar('Conversation marked as solved');        
      },
      error: (err) => {
        this.errorMessage = err || 'Failed to mark as solved. Please try again.';
        console.error('Failed to mark as solved:', err);
      }
    });
    console.log('Marking conversation as solved:', this.conversationId);
  }

  markAsUnsolved() {
    this.conversationService.updateStatus(this.conversationId, 'unsolved').subscribe({
      next: (res) => {
        this.openSnackBar('Conversation marked as solved');
        
      },
      error: (err) => {
        this.errorMessage = err || 'Failed to mark as solved. Please try again.';
        console.error('Failed to mark as solved:', err);
      }
    });
    console.log('Marking conversation as unsolved:', this.conversationId);
  }

  getCurrentTime(): string {
    const now = new Date();
    return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
  }

  sendMessage() {
    const message = this.newMessage.trim();
    if (!message) return;

    this.isSending = true;
    this.errorMessage = ''; // Clear any previous error messages
    
    this.conversationService.sendMessage(this.conversationId, message).subscribe({
      next: (res) => {
        this.newMessage = '';
        this.loadConversationMessages(this.conversationId);
        this.isSending = false;
      },
      error: (err) => {
        this.errorMessage = err || 'Failed to send message. Please try again.';
        this.isSending = false;
        console.error('Failed to send message:', err);
      }
    });
  }

  scrollToBottom() {
    const chatHistory = document.getElementById('chat-history');
    if (chatHistory) {
      chatHistory.scrollTop = chatHistory.scrollHeight;
    }
  }
  openSnackBar(msg: string = '') {
    this.snackBar.open(msg, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}

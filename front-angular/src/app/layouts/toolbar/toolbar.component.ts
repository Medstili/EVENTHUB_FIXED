import { Component, computed, EventEmitter , Output} from '@angular/core';
import { CommonModule }          from '@angular/common';
import { MatToolbarModule }      from '@angular/material/toolbar';
import { MatIconModule }         from '@angular/material/icon';
import { MatButtonModule }       from '@angular/material/button';
import { Router, RouterModule }          from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoginService } from '../../services/authService/login.service';
import { UserService } from '../../services/guestService/user.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    MatMenuModule,
    MatTooltipModule
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss'
})
export class ToolbarComponent {
  /** Emits when menu button is clicked */
  @Output() toggleSidenav = new EventEmitter<void>();

  constructor(
    private auth: LoginService, 
    private userService: UserService, 
    private router: Router,
    public themeService: ThemeService
  ){}

  get isLoggedin() {
    return this.auth.isLoggedIn();
  }

  get isDarkMode() {
    return this.themeService.isDarkMode();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  logout(){
    this.auth.logout().subscribe({
      next: ()=>{
        console.log("Logout successfully");
      },
      error: (err)=>{
        console.error("Logout Error", err);
      }
    })
  }

  profileLink = computed(() => {
    const u = this.auth.user();
    
    if (!u) return null;
    switch (u.role) {
      case 'organizer':   return ['/organizer-profile'];
      case 'participant': return ['/participant-profile'];
      case 'admin':       return ['/admin-profile'];
    }
  });

  ngOnInit() {
    this.auth.fetchCurrentUser().then(() => {
      const u = this.auth.user();
      if (u) {
        this.user = u;
      }
    });
  }

}

// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { OrganizerComponent }    from './user/organizer/organizer.component';
import { HomeComponent }         from './home/home.component';
import { LoginComponent }        from './auth/login/login.component';
import { RegisterComponent }     from './auth/register/register.component';
import { ForgotPasswordComponent }   from './auth/forgot-password/forgot-password.component';
import { ChangePasswordComponent }   from './auth/change-password/change-password.component';
import { EventComponent }        from './events/event.component';
import { AddEventComponent }     from './user/organizer/my-events/add-event/add-event.component';
import { UpdateEventComponent } from './user/organizer/my-events/update-event/update-event.component';
import { MyDashboardComponent }  from './user/organizer/my-dashboard/my-dashboard.component';
import { MyEventsComponent }     from './user/organizer/my-events/my-events.component';
import { MyAccountComponent }    from './user/organizer/my-account/my-account.component';
import { LoginGuard } from './guards/login.guard';
import { EditAccountComponent } from './user/organizer/edit-account/edit-account.component';
import { EditAccountComponent as adminEditAccountComponent } from './user/admin/account/edit-account/edit-account.component';
import { ParticipantReservationsComponent } from './user/participant/participant-tickets/participant-tickets.component';
import { ParticipantAccountComponent } from './user/participant/participant-account/participant-account.component';
import { ParticipantEditAccountComponent } from './user/participant/participant-edit-account/participant-edit-account.component';
import { ParticipantComponent } from './user/participant/participant.component';
import { TicketDetailsComponent as ParticpantTicketComponent } from './user/participant/ticket-details/ticket-details.component';
import { AboutComponent } from './about/about.component';
import { UsersComponent } from './user/admin/users/users.component';
import { TicketsComponent } from './user/admin/tickets/tickets.component';
import { EventsComponent } from './user/admin/events/events.component';
import { DashboardComponent } from './user/admin/dashboard/dashboard.component';
import { AdminComponent } from './user/admin/admin.component';
import { TicketDetailsComponent as AdminTicketDetailsComponent } from './user/admin/tickets/ticket-details/ticket-details.component';
import { AccountComponent } from './user/admin/account/account.component';
import { EventDetailsComponent } from './user/admin/events/event-details/event-details.component';
import { AddEventComponent as AdminAddEventComponent } from './user/admin/events/add-event/add-event.component';
import { EditEventComponent } from './user/admin/events/edit-event/edit-event.component';
import { MyEventComponent } from './user/admin/my-event/my-event.component';
import { MyTicketsComponent } from './user/admin/my-tickets/my-tickets.component';
import { MyTicketsComponent as OrganizerTicketsComponent } from './user/organizer/my-tickets/my-tickets.component';
import { TicketDetailsComponent as OrganizerTicketDetailsComponent } from './user/organizer/my-tickets/ticket-details/ticket-details.component';
import { TicketDetailsComponent as OwnedAdminTicketDetailsComponent } from './user/admin/my-tickets/ticket-details/ticket-details.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { ConversationsComponent } from './user/admin/conversations/conversations.component';
import { ChatComponent } from './user/admin/conversations/chat/chat.component';

export const routes: Routes = [
  // the private routes area
  {
    path: 'organizer-profile',
    component: OrganizerComponent,
    canActivate: [LoginGuard],
    children: [
      { path: '',            redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',   component: MyDashboardComponent },
      { path: 'user-events', component: MyEventsComponent },
      { path: 'account',     component: MyAccountComponent },
      { path: 'add-event',   component: AddEventComponent },
      { path: 'update-event/:id', component: UpdateEventComponent },
      { path: 'edit-account', component: EditAccountComponent },
      { path: 'user-tickets', component: OrganizerTicketsComponent},
      { path: 'user-ticket-details/:id',component: OrganizerTicketDetailsComponent}
    ]
  },
  {
    path: 'participant-profile',
    component: ParticipantComponent,
    canActivate: [LoginGuard],
    children: [
      { path: '',redirectTo: 'participant-reservations', pathMatch: 'full' },
      // { path: 'participant-dashboard',   component: ParticipantDashboardComponent },
      { path: 'participant-reservations', component: ParticipantReservationsComponent },
      { path: 'participant-account',     component: ParticipantAccountComponent },      
      { path: 'participant-edit-account', component: ParticipantEditAccountComponent },
      { path: 'ticket-details/:id',component: ParticpantTicketComponent},
    ]
  },
  {
    path: 'admin-profile',
    component: AdminComponent,
    canActivate: [LoginGuard],
    children: [
      { path: '',redirectTo: 'admin-dashboard', pathMatch: 'full' },
      { path: 'admin-dashboard',   component: DashboardComponent },
      { path: 'admin-events', component: EventsComponent },
      { path: 'admin-events/admin-event-details/:id',component: EventDetailsComponent},
      { path: 'admin-tickets/admin-event-details/:id',component: EventDetailsComponent},
      { path: 'admin-events/admin-add-event', component: AdminAddEventComponent},
      { path: 'admin-events/admin-event-details/:id/admin-edit-event', component: EditEventComponent },
      { path: 'admin-my-events', component: MyEventComponent},
      { path: 'admin-my-tickets', component: MyTicketsComponent},
      { path: 'admin-tickets',component: TicketsComponent},
      { path: 'admin-my-tickets/admin-ticket-details/:id', component: OwnedAdminTicketDetailsComponent},
      { path: 'admin-tickets/admin-ticket-details/:id', component: AdminTicketDetailsComponent},
      { path: 'admin-users',component: UsersComponent},
      { path: 'admin-account',     component: AccountComponent },      
      { path: 'admin-edit-account', component: adminEditAccountComponent },
      { path: 'admin-conversations', component: ConversationsComponent },
      { path: 'admin-conversations/chat/:id', component: ChatComponent },

    ]
  },
  // ───────────────────────────────────────

  // public routes area

  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home',                component: HomeComponent },
      { path: 'about',               component: AboutComponent },
      { path: 'login',               component: LoginComponent },
      { path: 'register',            component: RegisterComponent },
      { path: 'forgot-password',     component: ForgotPasswordComponent },
      { path: 'change-password',     component: ChangePasswordComponent },
      { path: 'events/:id',          component: EventComponent },
      { path: 'contact-us', component: ContactUsComponent },
    ]
  },


  // fallback
  { path: '**', redirectTo: '' },
];
// RouterModule.forRoot(routes, { enableTracing: true })

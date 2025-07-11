
import { Component }             from '@angular/core';
import { CommonModule }          from '@angular/common';
import { MatNavList }      from '@angular/material/list';
import { MatListModule }         from '@angular/material/list';
import { RouterModule }          from '@angular/router';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    RouterModule,
    MatNavList,
    MatIcon
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {}



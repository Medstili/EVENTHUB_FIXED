// src/app/home/filter/is-public-or-not/is-public-or-not.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';


@Component({
  selector: 'app-is-public-or-not',
  standalone: true,
  imports:[
    MatButtonModule,
    MatButtonToggleModule
  ],
  templateUrl: './is-public-or-not.component.html',
  styleUrls: ['./is-public-or-not.component.scss']

})
export class IsPublicOrNotComponent {
  /** incoming selection state: null=all, true=public, false=private */
  @Input() selected: boolean|null = null;

  /** emits the new selection */
  @Output() publicSelect = new EventEmitter<boolean|null>();

  select(val: boolean|null) {
    this.publicSelect.emit(val);
  }
}

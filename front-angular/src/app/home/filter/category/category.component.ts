import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Category } from '../../../services/categoryService/category.service';
import { CommonModule } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-category',
  standalone: true,
  imports:[
    CommonModule,
    MatCheckbox
  ],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent {
  @Input()  category!: Category;
  @Input()  selected = false;
  @Output() categorySelect = new EventEmitter<Category>();

  select() {
    this.categorySelect.emit(this.category);
  }
}

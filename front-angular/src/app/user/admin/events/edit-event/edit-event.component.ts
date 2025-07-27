import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { CategoryService } from '../../../../services/categoryService/category.service';
import { ActivatedRoute } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Location } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { formatDate } from '@angular/common';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../../../services/adminService/admin.service';
import { ResponsiveService } from '../../../../services/responsive.service';
import { AnimationService } from '../../../../services/animation.service';

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatRadioModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './edit-event.component.html',
  styleUrl: './edit-event.component.scss',
  animations: [
    AnimationService.fadeInUp,
    AnimationService.slideInLeft,
    AnimationService.staggerFadeIn,
    AnimationService.scaleIn
  ]
})
export class EditEventComponent implements OnInit {
  eventForm!: FormGroup;
  private id: any;
  public imagePreview: string = '';
  
  // Responsive observables
  isHandset$: Observable<boolean>;

  categories: any[] = [];
  selectedFile?: File;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private location: Location,
    private responsiveService: ResponsiveService,
    private snackBar: MatSnackBar
  ) {
    this.isHandset$ = this.responsiveService.isHandset$;
  }

  ngOnInit() {
    this.categoryService.getAll({})
      .subscribe((category) => {
        this.categories = category;
      });

    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      date: [null, Validators.required],
      time: ['', Validators.required],
      location: ['', [Validators.required, Validators.minLength(3)]],
      capacity: [1, [Validators.required, Validators.min(1)]],
      isPublic: [true],
      category: [null, Validators.required],
      image: [null],
      price: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
    });

    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.adminService.getEventById(this.id)
        .subscribe((event) => {
          this.eventForm.patchValue({
            title: event.title,
            description: event.description,
            date: new Date(event.date),
            time: event.time,
            location: event.location,
            capacity: event.capacity,
            isPublic: event.is_public ? true : false,
            category: event.category_id,
            price: event.price,
          });
          this.imagePreview = event.image_url;

          this.eventForm.markAsTouched();
          this.eventForm.updateValueAndValidity();
        });
    }

    this.eventForm.get('isPublic')?.valueChanges.subscribe(isPublic => {
      const priceControl = this.eventForm.get('price');
      if (!isPublic) {
        priceControl?.enable();
      } else {
        priceControl?.reset(0);
        priceControl?.disable();
      }
    });
  }

  onFileSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  removeImage() {
    this.selectedFile = undefined;
    this.imagePreview = '';
  }

  onSubmit() {
    if (this.eventForm.invalid) return;
    this.isSubmitting = true;

    const { isPublic, image, date, ...rawData } = this.eventForm.getRawValue();

    const formData = new FormData();
    Object.entries(rawData).forEach(([key, val]) => {
      formData.append(key, val as any);
    });

    const dateString = formatDate(date, 'yyyy-MM-dd', 'en-US');
    formData.append('date', dateString);
    formData.append('is_public', isPublic ? '1' : '0');

    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }
    formData.append('_method', 'PUT');

    this.adminService.updateEvent(this.id, formData)
      .subscribe({
        next: () => {
          this.openSnackBar('Event Updated Successfully');
          this.goBack();
        },
        error: (err) => {
          console.error(err);
          this.isSubmitting = false;
          this.openSnackBar('Updating Event Failed, Try again!');
        }
      });
  }

  onCancel() {
    this.eventForm.reset({ isPublic: false, price: 0, capacity: 1 });
    this.goBack();
  }

  goBack() {
    this.location.back();
  }

  openSnackBar(msg: string = '') {
    this.snackBar.open(msg, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { CategoryService } from '../../../../services/categoryService/category.service';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { Location } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { formatDate } from '@angular/common';
import { Observable } from 'rxjs';
import { AdminService } from '../../../../services/adminService/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ResponsiveService } from '../../../../services/responsive.service';
import { AnimationService } from '../../../../services/animation.service';

@Component({
  selector: 'app-add-event',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatCardModule,
    MatRadioModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './add-event.component.html',
  styleUrl: './add-event.component.scss',
  animations: [
    AnimationService.fadeInUp,
    AnimationService.slideInLeft,
    AnimationService.staggerFadeIn,
    AnimationService.scaleIn
  ]
})
export class AddEventComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
  eventForm!: FormGroup;
  
  // Responsive observables
  isHandset$: Observable<boolean>;
  isTablet$: Observable<boolean>;
  isDesktop$: Observable<boolean>;
  
  categories: any[] = [];
  selectedFile?: File;
  imagePreview?: string;
  isSubmitting = false;
  readonly MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private categoryService: CategoryService,
    private location: Location,
    private responsiveService: ResponsiveService,
    private snackBar: MatSnackBar,
    private route: Router
  ) {
    this.isHandset$ = this.responsiveService.isHandset$;
    this.isTablet$ = this.responsiveService.isTablet$;
    this.isDesktop$ = this.responsiveService.isDesktop$;
  }

  ngOnInit(): void {
    this.loadCategories();
    this.initializeForm();
    this.setupFormListeners();
  }

  private loadCategories(): void {
    this.categoryService.getAll({}).subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
      }
    });
  }

  private initializeForm(): void {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      date: [null, Validators.required],
      time: ['', Validators.required],
      location: ['', [Validators.required, Validators.minLength(3)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      capacity: [1, [Validators.required, Validators.min(1)]],
      isPublic: [true],
      category: [null, Validators.required],
      image: [null, Validators.required],
      price: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]]
    });
  }

  private setupFormListeners(): void {
    this.eventForm.get('isPublic')?.valueChanges.subscribe(isPublic => {
      const priceControl = this.eventForm.get('price');
      if (!isPublic) {
        priceControl?.enable();
        priceControl?.setValidators([Validators.required, Validators.min(0)]);
      } else {
        priceControl?.reset(0);
        priceControl?.disable();
        priceControl?.clearValidators();
      }
      priceControl?.updateValueAndValidity();
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      
      // Check file size
      if (file.size > this.MAX_FILE_SIZE) {
        this.openSnackBar('Image size must be less than 2MB');
        this.clearFileInput();
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        this.openSnackBar('Please select a valid image file');
        this.clearFileInput();
        return;
      }

      this.selectedFile = file;
      this.eventForm.get('image')!.setValue(this.selectedFile);

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  removeImage(): void {
    this.selectedFile = undefined;
    this.imagePreview = undefined;
    this.eventForm.get('image')!.setValue(null);
    this.clearFileInput();
  }

  private clearFileInput(): void {
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onSubmit(): void {
    if (this.eventForm.invalid) return;
    
    this.isSubmitting = true;
    const { isPublic, image, date, ...rawData } = this.eventForm.getRawValue();

    const formData = new FormData();
    Object.entries(rawData).forEach(([key, value]) => {
      formData.append(key, value as any);
    });

    const dateString = formatDate(date, 'yyyy-MM-dd', 'en-US');
    formData.append('date', dateString);
    formData.append('is_public', isPublic ? '1' : '0');

    if (this.selectedFile) {
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }

    this.adminService.createEvent(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.openSnackBar('Event created successfully');
        this.route.navigate(['/admin-profile/admin-events']);
      },
      error: (err) => {
        console.error('Create Event Failed', err);
        this.isSubmitting = false;
        this.openSnackBar('Error creating event');
      }
    });
  }

  onCancel(): void {
    this.eventForm.reset({ isPublic: true, price: 0, capacity: 1 });
    this.location.back();
  }

  goBack(): void {
    this.location.back();
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
    });
  }
}

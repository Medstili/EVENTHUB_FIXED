import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Location } from '@angular/common';
import { formatDate } from '@angular/common';
import { Observable } from 'rxjs';
import { OrganizerService } from '../../../../services/organizerServer/organizer.service';
import { CategoryService } from '../../../../services/categoryService/category.service';
import { ResponsiveService } from '../../../../services/responsive.service';
import { AnimationService } from '../../../../services/animation.service';

@Component({
  selector: 'app-add-event',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
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
    AnimationService.scaleIn,
    AnimationService.cardHover
  ]
})
export class AddEventComponent implements OnInit {
  eventForm!: FormGroup;
  isHandset$: Observable<boolean>;

  categories: any[] = [];
  selectedFile?: File;
  imagePreview?: string;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private organizerService: OrganizerService,
    private categoryService: CategoryService,
    private location: Location,
    public responsiveService: ResponsiveService
  ) {
    this.isHandset$ = this.responsiveService.isHandset$;

  }

  ngOnInit(): void {
    this.loadCategories();
    this.initializeForm();
    this.setupFormListeners();
  }

  private loadCategories(): void {
    this.categoryService.getAll().subscribe({
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
      this.selectedFile = input.files[0];
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

    this.organizerService.createEvent(formData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.location.back();
      },
      error: (err) => {
        console.error('Create Event Failed', err);
        this.isSubmitting = false;
        this.location.back();
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


}

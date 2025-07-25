import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ResponsiveService } from '../services/responsive.service';
import { AnimationService } from '../services/animation.service';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { ContactPayload, ContactUsServiceService } from '../services/contactUsService/contact-us-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss'],
  animations: [
    AnimationService.fadeInUp,
    AnimationService.staggerFadeIn,
    AnimationService.buttonPress,
    AnimationService.cardHover
  ]
})
export class ContactUsComponent implements OnInit {
  responsive = inject(ResponsiveService);
  fb = inject(FormBuilder);
  snackBar = inject(MatSnackBar);
  form!: FormGroup;
  submitted = false;
  loading = false;
  success = false;
  error = '';

  isMobile$ = this.responsive.isMobile$;
  isTablet$ = this.responsive.isTablet$;
  isDesktop$ = this.responsive.isDesktop$;

  // Add a class$ observable for ngClass
  class$ = this.responsive.responsiveState$.pipe(
    map(state => {
      if (state.isHandset || state.isMobile) return 'mobile';
      if (state.isTablet) return 'tablet';
      if (state.isDesktop) return 'desktop';
      return '';
    })
  );
  contactService = inject(ContactUsServiceService);
  

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.maxLength(1000)]]
    });
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;
    this.error = '';
    this.success = false;
    this.form.disable();

    if (this.form.invalid) {
      this.openSnackBar( "Invalide Information")
      this.form.enable();
      return;
    }

    this.loading = true;
    const payload: ContactPayload = {
      name: this.f['name'].value,
      email: this.f['email'].value,
      message: this.f['message'].value,
    };

    this.contactService.sendMessage(payload).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        this.form.reset();
        this.submitted = false;
        this.form.enable();
      },
      error: (errMsg: string) => {
        this.loading = false;
        this.error = errMsg;
        this.form.enable();

      }
    });
  }

  openSnackBar(msg: string = '') {
    this.snackBar.open(msg, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
}

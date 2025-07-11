import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../../services/authService/login.service';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({

  selector: 'app-change-password',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, 
             MatInputModule, MatButtonModule,
            MatCardModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  form: any


  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private auth: LoginService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {

    this.form = this.fb.group({
      token: [''],                  // hidden
      password: ['password', [Validators.required, Validators.minLength(8)]],
      confirm:  ['confirm', [Validators.required]],
    }, { validators: this.matchPasswords });


    this.route.queryParamMap.subscribe((params: { get: (arg0: string) => any; }) => {
      const tk = params.get('token');
      if (!tk) {
        // no token → go back
        this.router.navigate(['/login']);
      }
      this.form.get('token')!.setValue(tk);
    });
  }

  matchPasswords(group: FormGroup) {
    return group.get('password')!.value === group.get('confirm')!.value
      ? null : { mismatch: true };
  }

  submit() {
    if (this.form.invalid) return;
    const { token, password, confirm } = this.form.value;
    this.auth.resetPassword(token, password, confirm).subscribe({
      next: () =>{
        this.openSnackBar('password changed successfully');
         this.router.navigate(['/login'])
        },
      error: (err: { error: { message: any; }; }) => console.error('Reset failed', err.error?.message)
    });
  }

  openSnackBar(msg: string = '') {
    this.snackBar.open(msg, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    })
  }
}


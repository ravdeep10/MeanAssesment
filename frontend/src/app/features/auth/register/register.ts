import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Auth } from '../../../core/services/auth';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

const passwordsMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword
    ? null
    : { passwordsMismatch: true };
};
@Component({
  imports: [FormsModule, ReactiveFormsModule],
  selector: 'app-register',
  styleUrl: './register.scss',
  templateUrl: './register.html',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(Auth);
  private readonly router = inject(Router);

  loading = false;
  errorMessage = '';

  readonly registerForm = this.fb.nonNullable.group(
    {
      username: ['',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(30),
          Validators.pattern(/^[a-zA-Z0-9_]+$/),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(72),
        ],
      ],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: passwordsMatchValidator,
    }
  );

  onSubmit(): void {
    if (this.registerForm.invalid || this.loading) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { username, password } = this.registerForm.getRawValue();

    this.authService.register(username.trim(), password).subscribe({
      next: () => {
        void this.router.navigate(['/login'], {
          queryParams: { registered: '1' },
        });
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;

        if (error.status === 409) {
          this.errorMessage =
            'That username is already registered. Please choose another.';
        } else if (error.status === 400) {
          this.errorMessage =
            error.error?.message ||
            'Please check your username and password.';
        } else if (error.status === 0) {
          this.errorMessage =
            'Cannot connect to the server. Check that the backend is running.';
        } else {
          this.errorMessage =
            error.error?.message ||
            'Registration failed. Please try again.';
        }
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}

import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../../../core/services/auth';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.scss',
  templateUrl: './login.html',
})
export class Login {

private readonly fb = inject(FormBuilder);
  private readonly authService = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  loading = false;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.successMessage =
      this.route.snapshot.queryParamMap.get('registered') === '1'
        ? 'Registration successful! You can now sign in.'
        : '';
  }

  readonly loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.maxLength(30)]],
    password: ['', [Validators.required, Validators.maxLength(72)]],
  });

  onSubmit(): void {
    if (this.loginForm.invalid || this.loading) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const { username, password } = this.loginForm.getRawValue();

    this.authService.login(username.trim(), password).subscribe({
      next: () => {
        const requestedUrl =
          this.route.snapshot.queryParamMap.get('returnUrl');

        // Allow only local application paths, not external URLs.
        const returnUrl =
          requestedUrl?.startsWith('/') &&
          !requestedUrl.startsWith('//')
            ? requestedUrl
            : '/dashboard';

        void this.router.navigateByUrl(returnUrl);
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;

        if (error.status === 401) {
          this.errorMessage = 'Invalid username or password.';
        } else if (error.status === 0) {
          this.errorMessage =
            'Cannot connect to the server. Check that the backend is running.';
        } else {
          this.errorMessage =
            error.error?.message || 'Login failed. Please try again.';
        }
      },
      complete: () => {
        this.loading = false;
      },
    });
  }
}

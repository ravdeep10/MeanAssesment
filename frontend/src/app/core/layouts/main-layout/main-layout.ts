import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Auth } from '../../services/auth';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  imports: [AsyncPipe, RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-main-layout',
  styleUrl: './main-layout.scss',
  templateUrl: './main-layout.html',
})
export class MainLayout {
    private readonly authService = inject(Auth);
  private readonly router = inject(Router);

  readonly currentUser$ = this.authService.currentUser$;

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/login']);
  }
}

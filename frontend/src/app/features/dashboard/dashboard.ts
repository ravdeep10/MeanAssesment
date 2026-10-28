import { Component, inject } from '@angular/core';
import { Auth } from '../../core/services/auth';
import { WeatherComponent } from '../weather/weather';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  imports: [WeatherComponent,AsyncPipe,RouterLink],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly authService = inject(Auth);

  readonly currentUser$ = this.authService.currentUser$;
}

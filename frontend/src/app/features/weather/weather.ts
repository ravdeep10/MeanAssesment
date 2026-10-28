import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Weather, WeatherResponse } from '../../core/services/weather';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-weather',
  styleUrl: './weather.scss',
  templateUrl: './weather.html',
})
export class WeatherComponent {
  private readonly weatherService = inject(Weather);
  private readonly changeDetector = inject(ChangeDetectorRef);

  city = 'Delhi';
  weather: WeatherResponse | null = null;
  loading = false;
  errorMessage = '';

  get weatherDescription(): string {
    const code = this.weather?.current.weatherCode;

    const descriptions: Record<number, string> = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      80: 'Rain showers',
      81: 'Moderate rain showers',
      82: 'Heavy rain showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with hail',
      99: 'Thunderstorm with heavy hail',
    };

    return code === undefined
      ? ''
      : descriptions[code] ?? 'Conditions unavailable';
  }

  ngOnInit(): void {
    this.searchWeather();
  }

  searchWeather(): void {
    const city = this.city.trim();

    if (!city) {
      this.errorMessage = 'Please enter a city name.';
      this.weather = null;
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.weatherService.getWeather(city).subscribe({
      next: (data) => {
        this.weather = data;
        this.loading = false;
        this.changeDetector.markForCheck();
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.weather = null;

        if (error.status === 400) {
          this.errorMessage = 'Please enter a valid city name.';
        } else if (error.status === 404) {
          this.errorMessage = 'City not found. Try another city.';
        } else if (error.status === 502 || error.status === 504) {
          this.errorMessage =
            'The weather service is temporarily unavailable. Try again.';
        } else {
          this.errorMessage =
            'Unable to load weather. Check your connection and try again.';
        }
        this.changeDetector.markForCheck();
      },
    });
  }
}

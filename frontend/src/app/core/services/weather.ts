import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WeatherResponse {
  location: {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  current: {
    temperature: number;
    feelsLike: number | null;
    humidity: number | null;
    windSpeed: number | null;
    weatherCode: number;
    time: string;
  };
  units: {
    temperature: string;
    windSpeed: string;
  };
}

@Service()
export class Weather {
    private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.serverUrl}/weather`;

  getWeather(city: string): Observable<WeatherResponse> {
    const params = new HttpParams().set('city', city);

    return this.http.get<WeatherResponse>(
      this.apiUrl,
      { params }
    );
  }
}

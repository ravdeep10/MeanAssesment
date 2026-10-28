import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  id: number;
  username: string;
}

export interface AuthResponse {
  message?: string;
  token: string;
  user: AuthUser;
}

export interface RegisterResponse {
  message?: string;
  user: AuthUser;
}

@Service()
export class Auth {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.serverUrl}/auth`;
  private readonly tokenKey = 'user_token';
  private readonly userKey = 'user';

  private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(this.getStoredUser());

  readonly currentUser$ = this.currentUserSubject.asObservable();

  register(username: string, password: string): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, { username, password });
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, {
        username,
        password,
      })
      .pipe(
        tap((response) => {
          sessionStorage.setItem(this.tokenKey, response.token);
          sessionStorage.setItem(this.userKey, JSON.stringify(response.user));

          this.currentUserSubject.next(response.user);
        }),
      );
  }

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  getMe(): Observable<{ user: AuthUser }> {
    return this.http.get<{ user: AuthUser }>(`${this.apiUrl}/me`);
  }

  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  private getStoredUser(): AuthUser | null {
    const storedUser = sessionStorage.getItem(this.userKey);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as AuthUser;
    } catch {
      sessionStorage.removeItem(this.userKey);
      return null;
    }
  }
}

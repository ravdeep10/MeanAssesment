import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
 const authService = inject(Auth);
  const token = authService.getToken();
  
  if (!token) {
    return next(req);
  }

  const isBackendRequest = req.url.startsWith(
    'http://localhost:3000/api/'
  );

  if (!isBackendRequest) {
    return next(req);
  }

  const authenticatedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authenticatedRequest);
};

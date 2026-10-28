import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Dashboard } from './features/dashboard/dashboard';
import { authGuard } from './core/guards/auth-guard';
import { Products } from './features/products/products';
import { Orders } from './features/orders/orders';

export const routes: Routes = [
{
    path: 'login',
    component: Login,
  },
  {
    path: 'register',
    component: Register,
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
  },
//   {
//     path: 'weather',
//     component: WeatherComponent,
//     canActivate: [authGuard],
//   },
  {
    path: 'products',
    component: Products,
    canActivate: [authGuard],
  },
  {
    path: 'orders',
    component: Orders,
    canActivate: [authGuard],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Dashboard } from './features/dashboard/dashboard';
import { authGuard } from './core/guards/auth-guard';
import { Products } from './features/products/products';
import { Orders } from './features/orders/orders';
import { MainLayout } from './core/layouts/main-layout/main-layout';
import { WeatherComponent } from './features/weather/weather';

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
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
      },
      {
        path: 'weather',
        component: WeatherComponent,
      },
      {
        path: 'products',
        component: Products,
      },
      {
        path: 'orders',
        component: Orders,
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/landing/landing.routes').then((m) => m.landingRoutes),
  },
  {
    path: 'properties',
    loadChildren: () =>
      import('./features/property/property.routes').then((m) => m.propertyRoutes),
  }
];

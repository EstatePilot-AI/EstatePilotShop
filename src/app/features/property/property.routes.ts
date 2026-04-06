import { Routes } from "@angular/router";
import { PropertyList } from "./pages/property-list/property-list";
import { PropertyDetails } from "./pages/property-details/property-details";
import { PropertyUpdate } from './pages/property-update/property-update';

export const propertyRoutes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    component: PropertyList,
  },
  {
    path: 'update/:id',
    component: PropertyUpdate,
  },
  {
    path: ':id',
    component: PropertyDetails,
  },
]

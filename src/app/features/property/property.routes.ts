import { Routes } from "@angular/router";
import { PropertyList } from "./pages/property-list/property-list";
import { PropertyDetails } from "./pages/property-details/property-details";

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
    path: ':id',
    component: PropertyDetails,
  },
]

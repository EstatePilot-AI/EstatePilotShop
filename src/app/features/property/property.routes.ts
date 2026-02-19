import { Routes } from "@angular/router";
import { PropertyList } from "./pages/property-list/property-list";



export const propertyRoutes :Routes =[
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'list',
    component: PropertyList
  }
]

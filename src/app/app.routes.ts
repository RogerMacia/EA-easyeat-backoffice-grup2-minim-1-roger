import { Routes } from '@angular/router';
import { RestaurantList } from './restaurant-list/restaurant-list';
import { CustomerList } from './customer-list/customer-list';

export const routes: Routes = [
  { path: '', redirectTo: 'restaurants', pathMatch: 'full' },
  { path: 'restaurants', component: RestaurantList },
  { path: 'customers', component: CustomerList },
];

import { Routes } from '@angular/router';
import { OrganizationList } from './organization-list/organization-list';
import { UserList } from './user-list/user-list';

export const routes: Routes = [
  { path: '', component: OrganizationList },
  { path: 'users', component: UserList },
];

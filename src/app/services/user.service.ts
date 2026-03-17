import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';
import { Organization } from '../models/organization.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}
  
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(
      `${this.baseUrl}/users`
    );
  }

  getOrganizations(): Observable<Organization[]> {
    return this.http.get<Organization[]>(
      `${this.baseUrl}/organizations`
    );
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(
      `${this.baseUrl}/users/${id}`
    );
  }

  createUser(name: string, email: string, password: string, organization: string): Observable<User> {
    return this.http.post<User>(
      `${this.baseUrl}/users`,
      { name, email, password, organization }
    );
  }

  updateUser(id: string, name: string, email: string, password: string, organization: string): Observable<User> {
    return this.http.put<User>(
      `${this.baseUrl}/users/${id}`,
      { name, email, password, organization } 
    );
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/users/${id}`
    );
  }
}

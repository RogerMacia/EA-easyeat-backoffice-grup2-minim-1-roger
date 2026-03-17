import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Organization } from '../models/organization.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrganizationService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getOrganizations(): Observable<Organization[]> {
    return this.http.get<Organization[]>(
      `${this.baseUrl}/organizations`
    );
  }

  getOrganizationById(id: string): Observable<Organization> {
    return this.http.get<Organization>(
      `${this.baseUrl}/organizations/${id}`
    );
  }

  createOrganization(name: string): Observable<Organization> {
    return this.http.post<Organization>(
      `${this.baseUrl}/organizations`,
      { name }
    );
  }

  updateOrganization(id: string, name: string): Observable<Organization> {
    return this.http.put<Organization>(
      `${this.baseUrl}/organizations/${id}`,
      { name }
    );
  }

  deleteOrganization(id: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/organizations/${id}`
    );
  }
}

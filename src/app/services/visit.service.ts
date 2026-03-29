import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IVisit } from '../models/visit.model';

@Injectable({
  providedIn: 'root',
})
export class VisitService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getVisitsByRestaurantId(restaurantId: string): Observable<any> {
    const params = new HttpParams().set('restaurant_id', restaurantId);
    return this.http.get<any>(`${this.baseUrl}/visits`, { params });
  }

  getVisitsByCustomerId(customerId: string): Observable<IVisit[]> {
    console.log(`[VisitService] Requesting visits for customer: ${customerId}`);
    console.log(`[VisitService] URL: ${this.baseUrl}/customers/${customerId}/visits`);
    
    return this.http.get<IVisit[]>(
      `${this.baseUrl}/customers/${customerId}/visits`
    );
  }

  createVisit(data: Partial<IVisit>): Observable<IVisit> {
    return this.http.post<IVisit>(`${this.baseUrl}/visits`, data);
  }

  /**
   * Actualizar visita (Usado tanto para edición normal como para SOFT DELETE)
   */
  updateVisit(visitId: string, data: any): Observable<IVisit> {
    return this.http.put<IVisit>(`${this.baseUrl}/visits/${visitId}`, data);
  }

  deleteVisit(visitId: string): Observable<IVisit> {
    return this.http.delete<IVisit>(`${this.baseUrl}/visits/${visitId}`);
  }
}
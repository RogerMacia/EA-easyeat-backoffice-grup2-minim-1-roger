import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IVisit } from '../models/visit.model';

@Injectable({
  providedIn: 'root',
})
export class VisitService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getVisitsByRestaurantId(restaurantId: string): Observable<IVisit[]> {
    return this.http.get<IVisit[]>(`${this.baseUrl}/visits`, { params: { restaurant_id: restaurantId } });
  }

  createVisit(data: Partial<IVisit>): Observable<IVisit> {
    return this.http.post<IVisit>(`${this.baseUrl}/visits`, data);
  }

  updateVisit(visitId: string, data: Partial<IVisit>): Observable<IVisit> {
    return this.http.put<IVisit>(`${this.baseUrl}/visits/${visitId}`, data);
  }

  deleteVisit(visitId: string): Observable<IVisit> {
    return this.http.delete<IVisit>(`${this.baseUrl}/visits/${visitId}`);
  }
}

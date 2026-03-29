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

  /**
   * Obtener visitas por cliente con soporte para PAGINACIÓN
   * Ahora acepta 3 argumentos para coincidir con la llamada del componente
   */
  getVisitsByCustomer(customerId: string, page: number = 1, limit: number = 5): Observable<any> {
    // Configuramos los parámetros de la URL: ?customer_id=...&page=1&limit=5
    const params = new HttpParams()
      .set('customer_id', customerId)
      .set('page', page.toString())
      .set('limit', limit.toString());

    // Cambiamos el tipo de retorno a <any> porque ahora recibimos { data: [], pagination: {} }
    return this.http.get<any>(`${this.baseUrl}/visits`, { params });
  }

  getVisitsByRestaurantId(restaurantId: string): Observable<any> {
    const params = new HttpParams().set('restaurant_id', restaurantId);
    return this.http.get<any>(`${this.baseUrl}/visits`, { params });
  }

  getVisitsByCustomerId(customerId: string): Observable<IVisit[]> {
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
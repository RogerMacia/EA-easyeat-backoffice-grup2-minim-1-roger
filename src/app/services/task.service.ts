import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ITask } from '../models/task.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private baseUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  // ========================
  // GET ALL
  // ========================
  getAll(): Observable<ITask[]> {
    return this.http.get<ITask[]>(this.baseUrl);
  }

  // ========================
  // GET PAGINATED
  // ========================
  getPaginated(start: number, end: number): Observable<ITask[]> {
    return this.http.get<ITask[]>(
      `${this.baseUrl}/${start}/${end}`
    );
  }

  // ========================
  // GET BY RESTAURANT
  // ========================
  getByRestaurant(restaurantId: string): Observable<ITask[]> {
    return this.http.get<ITask[]>(
      `${this.baseUrl}/restaurant/${restaurantId}`
    );
  }

  // ========================
  // GET BY ID
  // ========================
  getById(taskId: string): Observable<ITask[]> {
    return this.http.get<ITask[]>(
      `${this.baseUrl}/restaurant/${taskId}`
    );
  }

  // ========================
  // CREATE
  // ========================
  create(task: Partial<ITask>): Observable<ITask> {
    return this.http.post<ITask>(this.baseUrl, task);
  }

  // ========================
  // UPDATE
  // ========================
  update(
    taskId: string,
    task: Partial<ITask>
  ): Observable<ITask> {
    return this.http.put<ITask>(
      `${this.baseUrl}/${taskId}`,
      task
    );
  }

  // ========================
  // DELETE
  // ========================
  delete(taskId: string): Observable<ITask> {
    return this.http.delete<ITask>(
      `${this.baseUrl}/${taskId}`
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Course {
  id: number;
  title: string;
  description?: string;
  category: string;
  level: string;
  duration?: string;
  image_url?: string;
  is_published: boolean;
  created_by?: number;
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class CoursesService {
  private api = `${environment.apiUrl}/api/courses`;

  constructor(private http: HttpClient) { }

  /**
   * Récupère la liste de TOUS les cours
   */
  getAllCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.api}/list`);
  }

  /**
   * Récupère le nombre de cours
   */
  getCoursesCount(): Observable<{ total: number }> {
    return this.http.get<{ total: number }>(`${this.api}/count`);
  }
}

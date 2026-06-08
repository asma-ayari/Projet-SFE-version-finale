import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CourseCreate {
  title: string;
  description?: string;
  category: string;
  level: string;
  duration?: string;
  image_url?: string;
  content?: string;
  video_url?: string;
  order?: number;
}

export interface CourseUpdate {
  title?: string;
  description?: string | null;
  category?: string;
  level?: string;
  duration?: string | null;
  image_url?: string | null;
  content?: string | null;
  video_url?: string | null;
  order?: number;
  is_published?: boolean;
}

export interface CourseItem {
  id: number;
  title: string;
  description?: string;
  category: string;
  level: string;
  duration?: string;
  image?: string;
  image_url?: string;
  video_url?: string;
  is_published: boolean;
  order: number;
  created_by?: number;
  created_at?: string;
}

export interface CourseDetail extends CourseItem {
  content?: string;
  updated_at?: string;
}

export interface PaginatedCourses {
  courses: CourseItem[];
  total: number;
  page: number;
  pages: number;
}

@Injectable({ providedIn: 'root' })
export class CoursService {
  private api = `${environment.apiUrl}/api/courses`;
  private readonly backendUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  normalizeImageUrlForSave(imageUrl?: string | null): string | undefined {
    if (!imageUrl?.trim()) {
      return undefined;
    }
    const trimmed = imageUrl.trim();
    if (trimmed.startsWith('/uploads/')) {
      return trimmed;
    }
    try {
      const parsed = new URL(trimmed);
      if (parsed.pathname.startsWith('/uploads/')) {
        return parsed.pathname;
      }
    } catch {
      // external URL or invalid — keep as-is for external images
    }
    return trimmed;
  }

  isValidImageReference(value: string): boolean {
    if (!value?.trim()) {
      return true;
    }
    const trimmed = value.trim();
    if (trimmed.startsWith('/uploads/')) {
      return true;
    }
    try {
      const url = new URL(trimmed);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  resolveImageUrl(imageUrl?: string | null): string {
    if (!imageUrl) {
      return '';
    }
    const trimmed = imageUrl.trim();
    if (!trimmed || trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
      return '';
    }
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        const parsed = new URL(trimmed);
        if (parsed.pathname.startsWith('/uploads/')) {
          return parsed.pathname;
        }
      } catch {
        return trimmed;
      }
      return trimmed;
    }
    if (trimmed.startsWith('/uploads/')) {
      return trimmed;
    }
    if (trimmed.startsWith('uploads/')) {
      return `/${trimmed}`;
    }
    return trimmed;
  }

  listPublished(category?: string, level?: string, lang?: 'fr' | 'ar'): Observable<CourseItem[]> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    if (level) params = params.set('level', level);
    if (lang) params = params.set('lang', lang);
    return this.http.get<CourseItem[]>(`${this.api}/published`, { params });
  }

  getPublished(id: number, lang?: 'fr' | 'ar'): Observable<CourseDetail> {
    let params = new HttpParams();
    if (lang) params = params.set('lang', lang);
    return this.http.get<CourseDetail>(`${this.api}/published/${id}`, { params });
  }

  get(id: number): Observable<CourseDetail> {
    return this.http.get<CourseDetail>(`${this.api}/${id}`);
  }

  manageList(page = 1, limit = 10, category?: string): Observable<PaginatedCourses> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (category) params = params.set('category', category);
    return this.http.get<PaginatedCourses>(`${this.api}/manage`, { params });
  }

  manageGet(id: number): Observable<CourseDetail> {
    return this.http.get<CourseDetail>(`${this.api}/manage/${id}`);
  }

  create(data: CourseCreate): Observable<CourseDetail> {
    return this.http.post<CourseDetail>(`${this.api}/`, data);
  }

  uploadCover(file: File): Observable<{ image_url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ image_url: string }>(`${this.api}/upload-cover`, formData);
  }

  update(id: number, data: CourseUpdate): Observable<CourseDetail> {
    return this.http.put<CourseDetail>(`${this.api}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  togglePublish(id: number): Observable<{ is_published: boolean }> {
    return this.http.put<{ is_published: boolean }>(`${this.api}/${id}/publish`, {});
  }
}

// Backward-compatible export name used by older specs or imports
export { CoursService as Cours };

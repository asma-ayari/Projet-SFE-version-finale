import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/* ─── Interfaces ─── */

export interface AnswerItem {
  id?: number;
  text: string;
  is_correct: boolean;
}

export interface QuestionItem {
  id?: number;
  text: string;
  image_url?: string;       // ✅ déjà présent
  explanation?: string;
  order: number;
  answers: AnswerItem[];
}

export interface QCMCreate {
  title: string;
  description?: string;
  category: string;
  difficulty: string;
  duration_minutes: number;
  pass_score: number;
  course_id?: number;
  questions: QuestionItem[];
}

export interface QCMListItem {
  id: number;
  title: string;
  description?: string;
  category: string;
  category_name?: string;
  difficulty: string;
  duration_minutes: number;
  pass_score: number;
  is_published: boolean;
  is_generated?: boolean;
  generation_mode?: string | null;
  generation_theme?: string | null;
  published_at?: string;
  course_id?: number;
  questions_count: number;
  results_count: number;
  created_at: string;
}

export interface QCMDetail {
  id: number;
  title: string;
  description?: string;
  category: string;
  category_name?: string;
  difficulty: string;
  duration_minutes: number;
  pass_score: number;
  is_published: boolean;
  published_at?: string;
  course_id?: number;
  created_at: string;
  questions: QuestionItem[];
}

export interface QCMGenerateRequest {
  mode: 'general' | 'specific';
  theme?: string;
  themes?: string[];
  question_count: number;
  duration_minutes: number;
  language: 'fr' | 'ar';
  difficulty: 'facile' | 'moyen' | 'difficile';
}

export interface QCMGenerateResponse {
  qcm_id: number;
  title: string;
  questions_count: number;
  duration_minutes: number;
}

export interface PaginatedQCM {
  qcms: QCMListItem[];
  total: number;
  page: number;
  pages: number;
}

export interface SubmitAnswer {
  question_id: number;
  answer_id: number;
}

export interface QCMResult {
  id: number;
  qcm_id: number;
  qcm_title: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  passed: boolean;
  duration_seconds?: number;
  completed_at: string;
  details?: any[];
}

export interface QCMCategory {
  id: number;
  slug: string;
  name: string;
  is_active: boolean;
}

// ✅ NOUVEAU - Interface réponse upload
export interface UploadImageResponse {
  image_url: string;
}

/* ─── Service ─── */

@Injectable({ providedIn: 'root' })
export class QcmService {
  private api = `${environment.apiUrl}/api/qcm`;

  constructor(private http: HttpClient) { }

  /* ── Categories ── */

  listCategories(): Observable<QCMCategory[]> {
    return this.http.get<QCMCategory[]>(`${this.api}/categories`);
  }

  createCategory(name: string): Observable<QCMCategory> {
    return this.http.post<QCMCategory>(`${this.api}/categories`, { name });
  }

  updateCategory(id: number, data: { name: string; is_active?: boolean }): Observable<QCMCategory> {
    return this.http.put<QCMCategory>(`${this.api}/categories/${id}`, data);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/categories/${id}`);
  }

  /* ── Admin ── */

  adminListQcms(
    page = 1,
    limit = 10,
    category?: string,
    isPublished?: boolean,
    includeGenerated?: boolean,
  ): Observable<PaginatedQCM> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (category) params = params.set('category', category);
    if (isPublished !== undefined) params = params.set('is_published', isPublished);
    if (includeGenerated !== undefined) params = params.set('include_generated', includeGenerated);
    return this.http.get<PaginatedQCM>(`${this.api}/admin/list`, { params });
  }

  adminGetQcm(id: number): Observable<QCMDetail> {
    return this.http.get<QCMDetail>(`${this.api}/admin/${id}`);
  }

  createQcm(data: QCMCreate): Observable<QCMDetail> {
    return this.http.post<QCMDetail>(this.api, data);
  }

  updateQcm(id: number, data: any): Observable<QCMDetail> {
    return this.http.put<QCMDetail>(`${this.api}/${id}`, data);
  }

  deleteQcm(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  togglePublish(id: number): Observable<{ is_published: boolean; published_at?: string }> {
    return this.http.put<{ is_published: boolean; published_at?: string }>(
      `${this.api}/${id}/publish`, {}
    );
  }

  // ✅ NOUVEAU - Upload image d'une question
  uploadQuestionImage(questionId: number, file: File): Observable<UploadImageResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadImageResponse>(
      `${this.api}/questions/${questionId}/upload-image`,
      formData
    );
  }

  // ✅ NOUVEAU - Supprimer image d'une question
  deleteQuestionImage(questionId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.api}/questions/${questionId}/image`
    );
  }

  /* ── Apprenant ── */

  listPublished(category?: string): Observable<QCMListItem[]> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    return this.http.get<QCMListItem[]>(`${this.api}/list`, { params });
  }

  getQcmForTest(id: number): Observable<QCMDetail> {
    return this.http.get<QCMDetail>(`${this.api}/${id}`);
  }

  submitQcm(
    id: number,
    answers: SubmitAnswer[],
    durationSeconds?: number
  ): Observable<QCMResult> {
    return this.http.post<QCMResult>(`${this.api}/${id}/submit`, {
      answers,
      duration_seconds: durationSeconds,
    });
  }

  generateQcm(payload: QCMGenerateRequest): Observable<QCMGenerateResponse> {
    return this.http.post<QCMGenerateResponse>(`${this.api}/generate`, payload);
  }

  getGeneratedQcmForTest(id: number): Observable<QCMDetail> {
    return this.http.get<QCMDetail>(`${this.api}/generated/${id}`);
  }

  submitGeneratedQcm(
    id: number,
    answers: SubmitAnswer[],
    durationSeconds?: number
  ): Observable<QCMResult> {
    return this.http.post<QCMResult>(`${this.api}/generated/${id}/submit`, {
      answers,
      duration_seconds: durationSeconds,
    });
  }

  getMyResults(): Observable<QCMResult[]> {
    return this.http.get<QCMResult[]>(`${this.api}/results/me`);
  }
}
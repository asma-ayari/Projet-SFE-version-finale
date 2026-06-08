import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminStats {
  users: { total: number; active: number; admins: number; formateurs: number; apprenants: number };
  qcm: { total: number; published: number; total_results: number; avg_score: number; pass_rate: number };
  courses: { total: number; published: number };
  feedback?: { total: number; positive: number; negative: number; positive_ratio: number };
}

export interface AdminDashboardDetails {
  monthly_registrations: { label: string; count: number }[];
  qcm_success_by_category: { category: string; label: string; success_rate: number; attempts: number }[];
  top_courses: { title: string; is_published: boolean; created_at: string; category: string }[];
  recent_activities: { type: string; user: string; action: string; created_at: string }[];
}

export interface FormateurStats {
  courses: { total: number; published: number; draft: number };
  users?: { apprenants: number };
}

export interface ApprenantStats {
  qcm: { completed: number; passed: number; failed: number; available: number; avg_score: number };
  courses: { available: number };
}

export interface QCMPassRate {
  qcm_id: number;
  title: string;
  pass_rate: number;
  total_attempts: number;
  passed_attempts: number;
}

export interface QCMPassRatesResponse {
  qcms: QCMPassRate[];
}

export interface UserRegistrationsResponse {
  period: string;
  labels: string[];
  data: number[];
}

@Injectable({ providedIn: 'root' })
export class StatisticsService {
  private api = `${environment.apiUrl}/api/statistics`;

  constructor(private http: HttpClient) { }

  getAdminStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.api}/admin`);
  }

  getAdminDashboardDetails(): Observable<AdminDashboardDetails> {
    return this.http.get<AdminDashboardDetails>(`${this.api}/admin/details`);
  }

  getFormateurStats(): Observable<FormateurStats> {
    return this.http.get<FormateurStats>(`${this.api}/formateur`);
  }

  getApprenantStats(): Observable<ApprenantStats> {
    return this.http.get<ApprenantStats>(`${this.api}/apprenant`);
  }

  getQCMPassRates(): Observable<QCMPassRatesResponse> {
    return this.http.get<QCMPassRatesResponse>(`${this.api}/qcm-pass-rates`);
  }

  getUserRegistrations(period: 'day' | 'week' | 'month' = 'month'): Observable<UserRegistrationsResponse> {
    return this.http.get<UserRegistrationsResponse>(`${this.api}/user-registrations?period=${period}`);
  }
}

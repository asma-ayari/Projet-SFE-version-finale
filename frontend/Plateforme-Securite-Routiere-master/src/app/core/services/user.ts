import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserItem {
  id: number;
  username: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  auth_provider: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface PaginatedUsers {
  users: UserItem[];
  total: number;
  page: number;
  pages: number;
}

export interface UsersStats {
  total: number;
  apprenants: number;
  formateurs: number;
  admins: number;
  actifs: number;
  inactifs: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private api = `${environment.apiUrl}/api/users`;

  getUsers(page = 1, limit = 10, search?: string, role?: string, isActive?: boolean): Observable<PaginatedUsers> {
    let params = new HttpParams().set('page', page).set('limit', limit);
    if (search) params = params.set('search', search);
    if (role && role !== 'all') params = params.set('role', role);
    if (isActive !== undefined) params = params.set('is_active', isActive);
    return this.http.get<PaginatedUsers>(this.api, { params });
  }

  getStats(): Observable<UsersStats> {
    return this.http.get<UsersStats>(`${this.api}/stats`);
  }

  createUser(data: { username: string; email: string; password: string; full_name?: string; role?: string }): Observable<UserItem> {
    return this.http.post<UserItem>(this.api, data);
  }

  updateRole(userId: number, role: string): Observable<UserItem> {
    return this.http.put<UserItem>(`${this.api}/${userId}/role`, { role });
  }

  updateStatus(userId: number, isActive: boolean): Observable<UserItem> {
    return this.http.put<UserItem>(`${this.api}/${userId}/status`, { is_active: isActive });
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${userId}`);
  }
}

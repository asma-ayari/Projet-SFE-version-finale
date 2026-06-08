import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, finalize, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService, UserResponse } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UseAvatarService {
  private readonly apiUrl = `${environment.apiUrl}/api/users`;
  private readonly avatarCacheKey = 'avatar_url_cache';

  avatarUrl = signal<string | null>(this.loadCachedAvatar());
  isSyncing = signal(false);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  initFromCacheAndSync() {
    const current = this.authService.currentUser();
    if (current?.avatar_url) {
      this.setAvatar(current.avatar_url, false);
    }

    return this.syncWithApi();
  }

  syncWithApi() {
    this.isSyncing.set(true);

    return this.http.get<UserResponse>(`${this.apiUrl}/me`).pipe(
      map((user) => ({ ...user, avatar_url: this.normalizeAvatarUrl(user.avatar_url) })),
      tap((user) => {
        this.authService.setCurrentUser(user);
        this.setAvatar(user.avatar_url, false);
      }),
      catchError(() => of(null)),
      finalize(() => this.isSyncing.set(false))
    );
  }

  setAvatar(avatarUrl: string | null, updateUser = true): void {
    const normalized = this.normalizeAvatarUrl(avatarUrl);
    this.avatarUrl.set(normalized);

    if (normalized) {
      localStorage.setItem(this.avatarCacheKey, normalized);
    } else {
      localStorage.removeItem(this.avatarCacheKey);
    }

    if (updateUser) {
      const current = this.authService.currentUser();
      if (current) {
        this.authService.setCurrentUser({ ...current, avatar_url: normalized });
      }
    }
  }

  clearAvatar(updateUser = true): void {
    this.setAvatar(null, updateUser);
  }

  private loadCachedAvatar(): string | null {
    const cached = localStorage.getItem(this.avatarCacheKey);
    return this.normalizeAvatarUrl(cached);
  }

  private normalizeAvatarUrl(avatarUrl: string | null | undefined): string | null {
    if (!avatarUrl) return null;

    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      return avatarUrl;
    }

    if (avatarUrl.startsWith('/')) {
      return `${environment.apiUrl}${avatarUrl}`;
    }

    return `${environment.apiUrl}/${avatarUrl}`;
  }
}

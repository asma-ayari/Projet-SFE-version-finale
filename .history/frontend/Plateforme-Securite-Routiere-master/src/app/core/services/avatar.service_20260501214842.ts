import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService, UserResponse } from './auth.service';

type UploadResponse = { avatar_url: string; message: string };

@Injectable({
  providedIn: 'root'
})
export class AvatarService {
  private apiUrl = `${environment.apiUrl}/api/users`;

  // Reactive avatar URL for the current user
  avatarUrl$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private authService: AuthService) {
    // If authService already has a user cached, initialize from it
    const user = this.authService.currentUser();
    if (user) {
      const key = this.localKeyFor(user.id);
      const cached = localStorage.getItem(key);
      if (cached) {
        this.avatarUrl$.next(cached);
      } else if (user.avatar_url) {
        this.avatarUrl$.next(user.avatar_url);
        localStorage.setItem(key, user.avatar_url);
      }
    }
  }

  /**
   * Uploader un nouvel avatar
   * @param file Fichier image à uploader (max 2 MB)
   * @returns Avatar URL et message de succès
   */
  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadResponse>(`${this.apiUrl}/me/avatar`, formData).pipe(
      tap((res) => {
        const avatar = this.normalize(res.avatar_url);
        const user = this.authService.currentUser();
        if (user) {
          this.setAvatarForUser(avatar, user.id);
          // update global user object
          this.authService.setCurrentUser({ ...user, avatar_url: avatar } as UserResponse);
        }
      })
    );
  }

  /**
   * Supprimer l'avatar actuel
   * @returns Message de confirmation
   */
  deleteAvatar() {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/me/avatar`).pipe(
      tap(() => {
        const user = this.authService.currentUser();
        if (user) {
          this.clearForUser(user.id);
          this.authService.setCurrentUser({ ...user, avatar_url: null } as UserResponse);
        }
      })
    );
  }

  /**
   * Valider l'image avant upload
   */
  validateImage(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 2 * 1024 * 1024; // 2 MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Format d\'image invalide. Accepté: JPEG, PNG, GIF, WebP' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'La taille du fichier dépasse 2 MB' };
    }

    return { valid: true };
  }

  /**
   * Générer l'aperçu de l'image
   */
  getImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /** Public helpers for persistence and sync */
  initForCurrentUser(): void {
    const user = this.authService.currentUser();
    if (!user) return;
    const key = this.localKeyFor(user.id);
    const cached = localStorage.getItem(key);
    if (cached) {
      this.avatarUrl$.next(cached);
    }

    // Verify with API in background
    this.http.get<UserResponse>(`${this.apiUrl}/me`).pipe(
      map((u) => ({ ...u, avatar_url: this.normalize(u.avatar_url) }))
    ).subscribe({
      next: (u) => {
        const avatar = u.avatar_url || null;
        this.setAvatarForUser(avatar, u.id);
      },
      error: () => {
        // ignore
      }
    });
  }

  setAvatarForUser(avatarUrl: string | null, userId: number) {
    const normalized = this.normalize(avatarUrl);
    const key = this.localKeyFor(userId);
    if (normalized) {
      localStorage.setItem(key, normalized);
    } else {
      localStorage.removeItem(key);
    }
    this.avatarUrl$.next(normalized);
  }

  clearForUser(userId: number) {
    const key = this.localKeyFor(userId);
    localStorage.removeItem(key);
    this.avatarUrl$.next(null);
  }

  clear(): void {
    // Remove all avatar_* keys
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith('avatar_')) localStorage.removeItem(k);
    });
    this.avatarUrl$.next(null);
  }

  private localKeyFor(userId: number) {
    return `avatar_${userId}`;
  }

  private normalize(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) return `${environment.apiUrl}${url}`;
    return `${environment.apiUrl}/${url}`;
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {
  private apiUrl = `${environment.apiUrl}/api/users`;

  constructor(private http: HttpClient) { }

  /**
   * Uploader un nouvel avatar
   * @param file Fichier image à uploader (max 2 MB)
   * @returns Avatar URL et message de succès
   */
  uploadAvatar(file: File): Observable<{ avatar_url: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ avatar_url: string; message: string }>(`${this.apiUrl}/avatar/upload`, formData);
  }

  /**
   * Supprimer l'avatar actuel
   * @returns Message de confirmation
   */
  deleteAvatar(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/avatar`);
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
}

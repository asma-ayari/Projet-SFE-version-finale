import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface VideoUploadResponse {
  id: string;
  title: string;
  url: string;
  duration?: number;
  thumbnail?: string;
}

export interface VideoResponse {
  id: number;
  title: string;
  description?: string;
  category: string;
  file_path: string;  // URL YouTube ou chemin local
  duration?: number;
  thumbnail_path?: string;
  file_size?: number;
  is_published: boolean;
  created_at: string;
  updated_at?: string;
  // Champs optionnels alternatifs (au cas où)
  youtube_url?: string;
  source_url?: string;
  video_url?: string;
}

export interface VideoImportResponse extends VideoResponse {
  already_exists: boolean;
}

export interface VideoImportRequest {
  url: string;
  title?: string;
  description?: string;
  category?: string;
}

export interface VideoUpdateRequest {
  title: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private readonly apiUrl = `${environment.apiUrl}/api/videos`;
  private readonly uploadTimeout = 600000; // 10 minutes

  constructor(private http: HttpClient) {}

  /**
   * Upload video file with progress tracking
   * Returns Observable<HttpEvent<VideoUploadResponse>> for progress monitoring
   */
  uploadVideo(
    file: File,
    title: string,
    description: string = '',
    category: string = 'general'
  ): Observable<HttpEvent<VideoUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);

    // Use HttpRequest for proper type handling with reportProgress
    const req = new HttpRequest('POST', `${this.apiUrl}/upload`, formData, {
      reportProgress: true
    });

    return this.http.request<VideoUploadResponse>(req).pipe(
      timeout(this.uploadTimeout),
      catchError(err => {
        console.error('❌ Upload error:', err);
        return throwError(() => ({
          message: err.error?.detail || 'Erreur lors du téléchargement',
          error: err.error
        }));
      })
    );
  }

  /**
   * Import video from URL
   * Returns Observable<VideoImportResponse> with already_exists flag
   */
  importFromUrl(request: VideoImportRequest): Observable<VideoImportResponse> {
    return this.http.post<VideoImportResponse>(
      `${this.apiUrl}/import`,
      request
    ).pipe(
      timeout(30000), // 30 seconds for URL import
      catchError(err => {
        console.error('❌ Import error:', err);
        return throwError(() => ({
          message: err.error?.detail || 'Erreur lors de l\'importation',
          error: err.error
        }));
      })
    );
  }

  /**
   * List all videos with optional filtering
   */
  listVideos(category?: string, publishedOnly: boolean = false, limit: number = 100): Observable<VideoResponse[]> {
    let url = this.apiUrl;
    if (category) {
      url += `?category=${encodeURIComponent(category)}`;
    }
    if (publishedOnly) {
      url += url.includes('?') ? '&' : '?';
      url += 'published_only=true';
    }
    url += url.includes('?') ? '&' : '?';
    url += `limit=${encodeURIComponent(limit)}`;
    return this.http.get<VideoResponse[]>(url).pipe(
      catchError(err => {
        console.error('❌ List error:', err);
        return throwError(() => ({
          message: 'Erreur lors du chargement des vidéos',
          error: err.error
        }));
      })
    );
  }

  /**
   * List published videos with optional filtering
   */
  listPublishedVideos(category?: string): Observable<VideoResponse[]> {
    return this.listVideos(category, true);
  }

  /**
   * Publish or unpublish a video
   */
  togglePublish(videoId: number): Observable<{ is_published: boolean }> {
    return this.http.put<{ is_published: boolean }>(`${this.apiUrl}/${videoId}/publish`, {}).pipe(
      catchError(err => {
        console.error('❌ Publish error:', err);
        return throwError(() => ({
          message: err.error?.detail || 'Erreur lors de la publication',
          error: err.error
        }));
      })
    );
  }

  /**
   * Delete video by ID
   */
  deleteVideo(videoId: string | number): Observable<{ message: string; id: number }> {
    return this.http.delete<{ message: string; id: number }>(`${this.apiUrl}/${videoId}`).pipe(
      catchError(err => {
        console.error('❌ Delete error:', err);
        return throwError(() => ({
          message: err.error?.detail || 'Erreur lors de la suppression',
          error: err.error
        }));
      })
    );
  }

  /**
   * Update video title and category
   */
  updateVideo(videoId: number, request: VideoUpdateRequest): Observable<VideoResponse> {
    return this.http.put<VideoResponse>(
      `${this.apiUrl}/${videoId}`,
      request
    ).pipe(
      catchError(err => {
        console.error('❌ Update error:', err);
        return throwError(() => ({
          message: err.error?.detail || 'Erreur lors de la mise à jour',
          error: err.error
        }));
      })
    );
  }

  /**
   * Extract YouTube video ID from URL
   * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
   */
  extractYoutubeVideoId(url: string): string | null {
    const regexps = [
      /youtu\.be\/([^\?&]+)/,
      /youtube\.com\/(?:embed\/|v\/|watch\?v=)([^\?&]+)/,
      /youtube\.com\/embed\/([^\?&]+)/,
    ];

    for (const regexp of regexps) {
      const match = url.match(regexp);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Build YouTube embed URL from video ID
   */
  buildYoutubeEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}?rel=0`;
  }
}

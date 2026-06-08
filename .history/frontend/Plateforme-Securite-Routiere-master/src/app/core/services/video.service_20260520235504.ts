import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { EMPTY, Observable, defer, throwError } from 'rxjs';
import { catchError, expand, finalize, reduce, timeout } from 'rxjs/operators';
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
  listVideos(
    category?: string,
    publishedOnly: boolean = false,
    limit: number = 100,
    formateurId?: number,
    skip: number = 0
  ): Observable<VideoResponse[]> {
    return this.http.get<VideoResponse[]>(this.buildVideosUrl(category, publishedOnly, limit, formateurId, skip)).pipe(
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
   * Count all videos for a formateur, with pagination to avoid API limit truncation.
   */
  countVideos(formateurId?: number, publishedOnly: boolean = false, category?: string): Observable<number> {
    const pageSize = 100;

    return defer(() => this.listVideos(category, publishedOnly, pageSize, formateurId, 0)).pipe(
      expand((videos, pageIndex) => {
        if (videos.length < pageSize) {
          return EMPTY;
        }

        const nextSkip = (pageIndex + 1) * pageSize;
        return this.listVideos(category, publishedOnly, pageSize, formateurId, nextSkip);
      }),
      reduce((count, videos) => count + videos.length, 0)
    );
  }

  /**
   * List published videos with optional filtering
   */
  listPublishedVideos(category?: string): Observable<VideoResponse[]> {
    return this.listVideos(category, true);
  }

  private buildVideosUrl(
    category?: string,
    publishedOnly: boolean = false,
    limit: number = 100,
    formateurId?: number,
    skip: number = 0
  ): string {
    let url = this.apiUrl;
    const params: string[] = [];

    if (category) {
      params.push(`category=${encodeURIComponent(category)}`);
    }
    if (typeof formateurId === 'number') {
      params.push(`formateur_id=${encodeURIComponent(formateurId)}`);
    }
    if (publishedOnly) {
      params.push('published_only=true');
    }

    params.push(`skip=${encodeURIComponent(skip)}`);
    params.push(`limit=${encodeURIComponent(limit)}`);

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return url;
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

import { Component, OnInit, inject, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChatbotWidgetComponent } from '../../shared/chatbot-widget/chatbot-widget';
import { VideoService, VideoResponse } from '../../core/services/video.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-videos-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, ChatbotWidgetComponent],
  templateUrl: './videos-list.html',
  styleUrl: './videos-list.css',
})
export class VideosList implements OnInit {
  private videoService = inject(VideoService);
  private authService = inject(AuthService);

  videos: VideoResponse[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.load();
    // reload when window regains focus (helps when auth/profile changed elsewhere)
    window.addEventListener('focus', this.onWindowFocus);
  }

  ngOnDestroy(): void {
    window.removeEventListener('focus', this.onWindowFocus);
  }

  private onWindowFocus = () => {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.videoService
      .listPublishedVideos()
      .pipe(
        timeout(8000),
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (videos) => {
          this.videos = Array.isArray(videos)
            ? [...videos].sort((a, b) => {
                const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
                const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
                return bTime - aTime;
              })
            : [];
        },
        error: (err) => {
          this.error = err?.error?.detail || err?.message || 'VIDEOS_PAGE.ERROR';
          this.videos = [];
        },
      });
  }

  getCategoryLabel(category: string): string {
    switch (category) {
      case 'general': return 'VIDEOS_PAGE.CATEGORIES.GENERAL';
      case 'conduite': return 'VIDEOS_PAGE.CATEGORIES.CONDUITE';
      case 'securite': return 'VIDEOS_PAGE.CATEGORIES.SECURITE';
      case 'secours': return 'VIDEOS_PAGE.CATEGORIES.SECOURS';
      case 'signalisation': return 'VIDEOS_PAGE.CATEGORIES.SIGNALISATION';
      default: return category;
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private extractVideoUrl(video: VideoResponse): string {
    const possibleUrls = [video.file_path, video.youtube_url, video.source_url, video.video_url].filter(
      (value): value is string => typeof value === 'string' && value.length > 0
    );

    return possibleUrls.find((value) => value.includes('youtube') || value.includes('youtu.be') || value.startsWith('http')) || '';
  }

  openVideo(video: VideoResponse): void {
    const url = this.extractVideoUrl(video);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }
}

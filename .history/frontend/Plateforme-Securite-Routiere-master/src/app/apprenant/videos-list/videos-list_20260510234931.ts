import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize, timeout } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChatbotWidgetComponent } from '../../shared/chatbot-widget/chatbot-widget';
import { VideoService, VideoResponse } from '../../core/services/video.service';

@Component({
  selector: 'app-videos-list',
  standalone: true,
  imports: [CommonModule, RouterLink, ChatbotWidgetComponent],
  templateUrl: './videos-list.html',
  styleUrl: './videos-list.css',
})
export class VideosList implements OnInit {
  private videoService = inject(VideoService);

  videos: VideoResponse[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
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
          this.error = err?.error?.detail || err?.message || 'Erreur lors du chargement des vidéos';
          this.videos = [];
        },
      });
  }

  getCategoryLabel(category: string): string {
    switch (category) {
      case 'general': return 'Général';
      case 'conduite': return 'Conduite';
      case 'securite': return 'Sécurité';
      case 'secours': return 'Premiers secours';
      case 'signalisation': return 'Signalisation';
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

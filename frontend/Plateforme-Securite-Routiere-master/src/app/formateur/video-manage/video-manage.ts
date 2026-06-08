import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { VideoService, VideoResponse, VideoUpdateRequest } from '../../core/services/video.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-video-manage',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './video-manage.html',
  styleUrl: './video-manage.css',
})
export class VideoManage implements OnInit {
  videos = signal<VideoResponse[]>([]);
  loading = signal(false);
  deleting = signal<number | null>(null);
  updating = signal<number | null>(null);
  publishing = signal<number | null>(null);
  error = signal('');
  success = signal('');
  filterCategory = signal('');

  // Modal d'édition
  editForm!: FormGroup;
  editingVideoId = signal<number | null>(null);
  showEditModal = signal(false);

  // Lecteur vidéo
  selectedVideo = signal<VideoResponse | null>(null);
  showVideoPlayer = signal(false);

  categories = [
    { value: '', labelKey: 'FORMATEUR.VIDEO_MANAGE.CATEGORIES.ALL' },
    { value: 'general', labelKey: 'FORMATEUR.VIDEO_MANAGE.CATEGORIES.GENERAL' },
    { value: 'conduite', labelKey: 'FORMATEUR.VIDEO_MANAGE.CATEGORIES.CONDUITE' },
    { value: 'securite', labelKey: 'FORMATEUR.VIDEO_MANAGE.CATEGORIES.SECURITE' },
    { value: 'secours', labelKey: 'FORMATEUR.VIDEO_MANAGE.CATEGORIES.SECOURS' },
    { value: 'signalisation', labelKey: 'FORMATEUR.VIDEO_MANAGE.CATEGORIES.SIGNALISATION' },
  ];

  constructor(
    private videoService: VideoService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private translate: TranslateService
  ) {
    this.initializeEditForm();
  }

  ngOnInit(): void {
    this.load();
  }

  /**
   * Initialiser le formulaire d'édition
   */
  private initializeEditForm(): void {
    this.editForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      category: ['general', Validators.required],
    });
  }

  /**
   * Charger les vidéos du formateur
   */
  load(): void {
    this.loading.set(true);
    console.log('🚀 Chargement des vidéos...', { category: this.filterCategory() });

    this.videoService
      .listVideos(this.filterCategory() || undefined)
      .pipe(
        finalize(() => {
          this.loading.set(false);
          console.log('✅ Chargement terminé');
        })
      )
      .subscribe({
        next: (videos: VideoResponse[]) => {
          console.log('✅ Vidéos reçues:', videos.length);
          this.videos.set(videos);
        },
        error: (err) => {
          console.error('❌ Erreur:', err);
          this.error.set(err.message || this.translate.instant('FORMATEUR.VIDEO_MANAGE.MESSAGES.LOAD_ERROR'));
        },
      });
  }

  /**
   * Publier ou depublier une video
   */
  togglePublish(video: VideoResponse): void {
    this.publishing.set(video.id);

    this.videoService.togglePublish(video.id).subscribe({
      next: (res) => {
        const videos = this.videos();
        const index = videos.findIndex((item) => item.id === video.id);
        if (index !== -1) {
          videos[index] = { ...videos[index], is_published: res.is_published };
          this.videos.set([...videos]);
        }

        this.success.set(
          this.translate.instant('FORMATEUR.VIDEO_MANAGE.MESSAGES.PUBLISH_TOGGLE_SUCCESS', {
            title: video.title,
            status: this.translate.instant(
              res.is_published
                ? 'FORMATEUR.VIDEO_MANAGE.STATUS.PUBLISHED'
                : 'FORMATEUR.VIDEO_MANAGE.STATUS.DRAFT'
            ),
          })
        );
        setTimeout(() => this.success.set(''), 3000);
      },
      error: (err) => {
        console.error('❌ Erreur de publication:', err);
        this.error.set(err.message || this.translate.instant('FORMATEUR.VIDEO_MANAGE.MESSAGES.PUBLISH_ERROR'));
      },
      complete: () => {
        this.publishing.set(null);
      },
    });
  }

  /**
   * Changer le filtre de catégorie
   */
  onFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.filterCategory.set(value);
    this.load();
  }

  /**
   * Ouvrir la modal d'édition
   */
  openEditModal(video: VideoResponse): void {
    this.editingVideoId.set(video.id);
    this.editForm.patchValue({
      title: video.title,
      category: video.category,
    });
    this.showEditModal.set(true);
    console.log('📝 Modal d\'édition ouverte pour vidéo ID:', video.id);
  }

  /**
   * Fermer la modal d'édition
   */
  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingVideoId.set(null);
    this.editForm.reset();
  }

  /**
   * Sauvegarder les modifications de la vidéo
   */
  saveVideoChanges(): void {
    if (!this.editForm.valid || !this.editingVideoId()) {
      return;
    }

    const videoId = this.editingVideoId()!;
    const updateRequest: VideoUpdateRequest = {
      title: this.editForm.value.title,
      category: this.editForm.value.category,
    };

    this.updating.set(videoId);
    console.log('💾 Mise à jour vidéo ID:', videoId, updateRequest);

    this.videoService.updateVideo(videoId, updateRequest).subscribe({
      next: (updatedVideo) => {
        console.log('✅ Vidéo mise à jour:', updatedVideo);
        
        // Mettre à jour la vidéo dans la liste
        const videos = this.videos();
        const index = videos.findIndex((v) => v.id === videoId);
        if (index !== -1) {
          videos[index] = updatedVideo;
          this.videos.set([...videos]);
        }

        this.success.set(
          this.translate.instant('FORMATEUR.VIDEO_MANAGE.MESSAGES.UPDATE_SUCCESS', {
            title: updatedVideo.title,
          })
        );
        this.closeEditModal();
        setTimeout(() => this.success.set(''), 3000);
      },
      error: (err) => {
        console.error('❌ Erreur lors de la mise à jour:', err);
        this.error.set(err.message || this.translate.instant('FORMATEUR.VIDEO_MANAGE.MESSAGES.UPDATE_ERROR'));
      },
      complete: () => {
        this.updating.set(null);
      },
    });
  }

  /**
   * Supprimer une vidéo
   */
  deleteVideo(video: VideoResponse): void {
    if (!confirm(this.translate.instant('FORMATEUR.VIDEO_MANAGE.MESSAGES.DELETE_CONFIRM', { title: video.title }))) {
      return;
    }

    this.deleting.set(video.id);
    console.log('🗑️  Suppression de la vidéo:', video.id);

    this.videoService.deleteVideo(video.id).subscribe({
      next: () => {
        console.log('✅ Vidéo supprimée');
        this.success.set(
          this.translate.instant('FORMATEUR.VIDEO_MANAGE.MESSAGES.DELETE_SUCCESS', {
            title: video.title,
          })
        );
        this.videos.set(this.videos().filter((v) => v.id !== video.id));
        setTimeout(() => this.success.set(''), 3000);
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.error.set(err.message || this.translate.instant('FORMATEUR.VIDEO_MANAGE.MESSAGES.DELETE_ERROR'));
      },
      complete: () => {
        this.deleting.set(null);
      },
    });
  }

  /**
   * Ouvrir le lecteur vidéo
   */
  openVideoPlayer(video: VideoResponse): void {
    this.selectedVideo.set(video);
    this.showVideoPlayer.set(true);

    // 🔍 DEBUG: Afficher l'objet complet pour identifier le champ URL YouTube
    console.log('🔍 Objet vidéo complet:', JSON.stringify(video, null, 2));
    console.log('📹 Analyse des champs:');
    console.log('  - file_path:', video.file_path ? `✓ ${video.file_path}` : '❌ undefined');
    console.log('  - youtube_url:', (video as any).youtube_url ? `✓ ${(video as any).youtube_url}` : '❌ undefined');
    console.log('  - source_url:', (video as any).source_url ? `✓ ${(video as any).source_url}` : '❌ undefined');
    console.log('  - video_url:', (video as any).video_url ? `✓ ${(video as any).video_url}` : '❌ undefined');
    console.log('▶️  Lecteur vidéo ouvert pour:', video.title);
    console.log('✓ isYoutubeVideo() =', this.isYoutubeVideo(video));
    console.log('embed URL =', this.getYoutubeEmbedUrl(video) ? '✓ OK' : '❌ null');
  }

  /**
   * Fermer le lecteur vidéo
   */
  closeVideoPlayer(): void {
    this.showVideoPlayer.set(false);
    this.selectedVideo.set(null);
  }

  /**
   * Obtenir l'URL d'intégration YouTube de manière sécurisée
   * Cherche dans tous les champs possibles et extrait le videoId
   */
  getYoutubeEmbedUrl(video: VideoResponse | null | undefined): SafeResourceUrl | null {
    if (!video) {
      return null;
    }

    // Chercher l'URL YouTube dans tous les champs possibles
    const possibleUrls = [
      video.file_path,
      (video as any).youtube_url,
      (video as any).source_url,
      (video as any).video_url,
    ].filter(url => typeof url === 'string' && url.length > 0);

    let youtubeUrl: string | null = null;
    for (const url of possibleUrls) {
      if (url && (url.includes('youtube') || url.includes('youtu.be'))) {
        youtubeUrl = url;
        break;
      }
    }

    if (!youtubeUrl) {
      console.warn('⚠️ Aucune URL YouTube trouvée');
      return null;
    }

    const videoId = this.videoService.extractYoutubeVideoId(youtubeUrl);
    if (!videoId) {
      console.warn('⚠️ Impossible d\'extraire le videoId de:', youtubeUrl);
      return null;
    }

    const embedUrl = this.videoService.buildYoutubeEmbedUrl(videoId);
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  /**
   * Obtenir le type de vidéo (youtube ou local)
   * Cherche dans tous les champs possibles
   */
  isYoutubeVideo(video: VideoResponse | null | undefined): boolean {
    if (!video) {
      return false;
    }

    // Chercher YouTube dans tous les champs possibles
    const possibleUrls = [
      video.file_path,
      (video as any).youtube_url,
      (video as any).source_url,
      (video as any).video_url,
    ];

    return possibleUrls.some(
      url => typeof url === 'string' &&
             (url.includes('youtube') || url.includes('youtu.be'))
    );
  }

  /**
   * Formater la taille du fichier en MB
   */
  formatFileSize(bytes?: number): string {
    if (!bytes) return '-';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  }

  /**
   * Formater la date
   */
  formatDate(dateString: string): string {
    const lang = this.translate.currentLang || this.translate.getDefaultLang() || 'fr';
    const locale = lang === 'ar' ? 'ar-TN' : 'fr-FR';
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Obtenir le label de la catégorie
   */
  getCategoryLabel(categoryValue: string): string {
    const cat = this.categories.find((c) => c.value === categoryValue);
    return cat ? this.translate.instant(cat.labelKey) : categoryValue;
  }

  /**
   * Obtenir le libellé du statut de publication
   */
  getPublicationLabel(video: VideoResponse): string {
    return this.translate.instant(
      video.is_published
        ? 'FORMATEUR.VIDEO_MANAGE.STATUS.PUBLISHED'
        : 'FORMATEUR.VIDEO_MANAGE.STATUS.DRAFT'
    );
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VideoService, VideoResponse, VideoUpdateRequest } from '../../core/services/video.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-video-manage',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
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
    { value: '', label: 'Toutes les catégories' },
    { value: 'general', label: 'Général' },
    { value: 'conduite', label: 'Conduite' },
    { value: 'securite', label: 'Sécurité' },
    { value: 'secours', label: 'Premiers secours' },
    { value: 'signalisation', label: 'Signalisation' },
  ];

  constructor(
    private videoService: VideoService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
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
          this.error.set(err.message || 'Erreur de chargement');
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

        this.success.set(`Vidéo "${video.title}" ${res.is_published ? 'publiée' : 'mise en brouillon'}`);
        setTimeout(() => this.success.set(''), 3000);
      },
      error: (err) => {
        console.error('❌ Erreur de publication:', err);
        this.error.set(err.message || 'Erreur lors de la publication');
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

        this.success.set(`Vidéo "${updatedVideo.title}" mise à jour avec succès`);
        this.closeEditModal();
        setTimeout(() => this.success.set(''), 3000);
      },
      error: (err) => {
        console.error('❌ Erreur lors de la mise à jour:', err);
        this.error.set(err.message || 'Erreur lors de la mise à jour');
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
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la vidéo "${video.title}"?`)) {
      return;
    }

    this.deleting.set(video.id);
    console.log('🗑️  Suppression de la vidéo:', video.id);

    this.videoService.deleteVideo(video.id).subscribe({
      next: () => {
        console.log('✅ Vidéo supprimée');
        this.success.set(`Vidéo "${video.title}" supprimée avec succès`);
        this.videos.set(this.videos().filter((v) => v.id !== video.id));
        setTimeout(() => this.success.set(''), 3000);
      },
      error: (err) => {
        console.error('❌ Erreur:', err);
        this.error.set(err.message || 'Erreur lors de la suppression');
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
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
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
    return cat ? cat.label : categoryValue;
  }

  /**
   * Obtenir le libellé du statut de publication
   */
  getPublicationLabel(video: VideoResponse): string {
    return video.is_published ? 'Publié' : 'Brouillon';
  }
}

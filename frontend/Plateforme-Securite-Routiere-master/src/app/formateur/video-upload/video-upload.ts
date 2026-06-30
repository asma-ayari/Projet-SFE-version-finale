import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VideoService } from '../../core/services/video.service';
import { HttpEventType } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

@Component({
  selector: 'app-video-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './video-upload.html',
  styleUrl: './video-upload.css',
})
export class VideoUpload implements OnInit {
  // Forms
  uploadForm!: FormGroup;
  importForm!: FormGroup;

  // State Signals
  activeTab = signal<'upload' | 'import'>('upload');
  isSubmitting = signal(false);
  uploadProgress = signal<UploadProgress | null>(null);
  error = signal('');
  success = signal('');
  selectedFile = signal<File | null>(null);
  
  // État pour les vidéos doublons
  existingVideoId = signal<number | null>(null);
  showExistingLink = signal(false);

  // Categories
  categories = [
    { value: 'general', labelKey: 'FORMATEUR.VIDEO_UPLOAD.CATEGORIES.GENERAL' },
    { value: 'conduite', labelKey: 'FORMATEUR.VIDEO_UPLOAD.CATEGORIES.CONDUITE' },
    { value: 'securite', labelKey: 'FORMATEUR.VIDEO_UPLOAD.CATEGORIES.SECURITE' },
    { value: 'secours', labelKey: 'FORMATEUR.VIDEO_UPLOAD.CATEGORIES.SECOURS' },
    { value: 'signalisation', labelKey: 'FORMATEUR.VIDEO_UPLOAD.CATEGORIES.SIGNALISATION' },
    { value: 'physique', labelKey: 'FORMATEUR.VIDEO_UPLOAD.CATEGORIES.PHYSIQUE' },
  ];

  constructor(
    private fb: FormBuilder,
    private videoService: VideoService,
    private translate: TranslateService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    // Forms initialized in constructor
  }

  /**
   * Initialize both upload and import forms with validation
   */
  private initializeForms(): void {
    // Upload form for local file
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      category: ['general'],
    });

    // Import form for URL
    this.importForm = this.fb.group({
      url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      category: ['general'],
    });
  }

  /**
   * Handle file selection with validation
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) {
      this.selectedFile.set(null);
      return;
    }

    const file = files[0];

    // Validate file type
    const validTypes = [
      'video/mp4',
      'video/x-msvideo',
      'video/quicktime',
      'video/x-matroska',
      'video/webm'
    ];

    if (!validTypes.includes(file.type)) {
      this.error.set(this.translate.instant('FORMATEUR.VIDEO_UPLOAD.MESSAGES.UNSUPPORTED_FORMAT'));
      this.selectedFile.set(null);
      return;
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      this.error.set(this.translate.instant('FORMATEUR.VIDEO_UPLOAD.MESSAGES.FILE_TOO_LARGE'));
      this.selectedFile.set(null);
      return;
    }

    this.selectedFile.set(file);
    this.error.set('');
    console.log('📁 Fichier sélectionné:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);
  }

  /**
   * Handle file upload with progress tracking
   */
  onUploadVideo(): void {
    if (!this.uploadForm.valid || !this.selectedFile()) {
      this.error.set(this.translate.instant('FORMATEUR.VIDEO_UPLOAD.MESSAGES.UPLOAD_REQUIRED'));
      return;
    }

    this.isSubmitting.set(true);
    this.error.set('');
    this.success.set('');

    const { title, description, category } = this.uploadForm.value;
    const file = this.selectedFile()!;

    console.log('🚀 Démarrage du téléchargement:', title);

    // Use finalize to ensure isSubmitting is always reset
    this.videoService
      .uploadVideo(file, title, description, category)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
          this.uploadProgress.set(null);
        })
      )
      .subscribe({
        next: (event) => {
          // Track progress events
          if (event.type === HttpEventType.UploadProgress && event.total) {
            const progress = Math.round((100 * event.loaded) / event.total);
            this.uploadProgress.set({
              loaded: event.loaded,
              total: event.total,
              percentage: progress,
            });
            console.log(`📤 Progression: ${progress}%`);
          }
          // Handle successful response
          else if (event.type === HttpEventType.Response) {
            console.log('✅ Vidéo téléchargée avec succès:', event.body);
            this.success.set(this.translate.instant('FORMATEUR.VIDEO_UPLOAD.MESSAGES.UPLOAD_SUCCESS'));
            this.resetUploadForm();

            // Auto-clear success message
            setTimeout(() => this.success.set(''), 3000);
          }
        },
        error: (err) => {
          console.error('❌ Erreur de téléchargement:', err);
          this.error.set(err.message || this.translate.instant('FORMATEUR.VIDEO_UPLOAD.MESSAGES.UPLOAD_ERROR'));
        },
        // complete() is called automatically after finalize()
      });
  }

  /**
   * Handle URL import
   */
  onImportVideo(): void {
    if (!this.importForm.valid) {
      this.error.set(this.translate.instant('FORMATEUR.VIDEO_UPLOAD.MESSAGES.IMPORT_REQUIRED'));
      return;
    }

    this.isSubmitting.set(true);
    this.error.set('');
    this.success.set('');

    const formValue = this.importForm.value;
    console.log('🔗 Importation vidéo depuis URL:', formValue.url);

    // Use finalize to ensure isSubmitting is always reset
    this.videoService
      .importFromUrl(formValue)
      .pipe(
        finalize(() => {
          this.isSubmitting.set(false);
        })
      )
      .subscribe({
        next: (response) => {
          console.log('✅ Vidéo importée avec succès:', response);
          
          // Vérifier si la vidéo existait déjà
          if (response.already_exists) {
            // Vidéo déjà importée — afficher message informatif avec lien
            this.existingVideoId.set(response.id);
            this.showExistingLink.set(true);
            this.error.set(this.translate.instant('FORMATEUR.VIDEO_UPLOAD.MESSAGES.ALREADY_IMPORTED'));
            console.info('📌 Vidéo existante détectée (ID:', response.id, ')');
          } else {
            // Nouvelle vidéo — afficher succès
            this.success.set(this.translate.instant('FORMATEUR.VIDEO_UPLOAD.MESSAGES.IMPORT_SUCCESS'));
            this.resetImportForm();
            
            // Auto-clear success message
            setTimeout(() => this.success.set(''), 3000);
          }
        },
        error: (err) => {
          console.error('❌ Erreur d\'importation:', err);
          this.existingVideoId.set(null);
          this.showExistingLink.set(false);
          this.error.set(err.message || this.translate.instant('FORMATEUR.VIDEO_UPLOAD.MESSAGES.IMPORT_ERROR'));
        },
        // complete() is called automatically after finalize()
      });
  }

  /**
   * Reset upload form to initial state
   */
  private resetUploadForm(): void {
    this.uploadForm.reset({ category: 'general' });
    this.selectedFile.set(null);
  }

  /**
   * Reset import form to initial state
   */
  private resetImportForm(): void {
    this.importForm.reset({ category: 'general' });
  }

  /**
   * Accessing existing video (after already_exists)
   */
  viewExistingVideo(): void {
    const videoId = this.existingVideoId();
    if (videoId) {
      console.log('🎬 Accès à la vidéo existante ID:', videoId);
      // Option 1: Navigation (si vous avez une route pour voir les détails)
      // this.router.navigate(['/video', videoId]);
      
      // Option 2: Copier l'ID et fermer le message
      navigator.clipboard.writeText(videoId.toString()).then(() => {
        console.log('✅ ID copié:', videoId);
        this.showExistingLink.set(false);
        // Vous pouvez aussi afficher un snackbar "ID copié!"
      });
    }
  }

  /**
   * Clear the existing video link message
   */
  clearExistingLink(): void {
    this.showExistingLink.set(false);
    this.existingVideoId.set(null);
    this.error.set('');
  }

  /**
   * Get human-readable file size
   */
  getFileSize(): string {
    const file = this.selectedFile();
    if (!file) return '';
    const mb = (file.size / 1024 / 1024).toFixed(2);
    return `${file.name} (${mb} MB)`;
  }

  /**
   * Switch between upload and import tabs
   */
  switchTab(tab: 'upload' | 'import'): void {
    this.activeTab.set(tab);
    this.error.set('');
    this.success.set('');
    this.uploadProgress.set(null);
  }
}

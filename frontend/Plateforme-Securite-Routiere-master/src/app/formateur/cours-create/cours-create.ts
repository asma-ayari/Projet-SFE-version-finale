import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CoursService, CourseCreate } from '../../core/services/cours';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-cours-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './cours-create.html',
  styleUrl: './cours-create.css',
})
export class CoursCreate {
  title = '';
  description = '';
  category = 'general';
  level = 'debutant';
  duration = '';
  image_url = '';
  video_url = '';
  content = '';
  saving = false;
  error = '';
  coverFile: File | null = null;
  coverPreview = '';

  constructor(
    private coursService: CoursService,
    private router: Router,
    private translate: TranslateService
  ) { }

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.error = this.translate.instant('FORMATEUR.COURS_CREATE.MESSAGES.INVALID_IMAGE');
      return;
    }

    this.coverFile = file;
    this.image_url = '';
    this.error = '';

    const reader = new FileReader();
    reader.onload = () => {
      this.coverPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onImageUrlChange(): void {
    if (this.coverFile) {
      return;
    }
    const trimmed = this.image_url.trim();
    this.coverPreview = trimmed && this.coursService.isValidImageReference(trimmed)
      ? this.coursService.resolveImageUrl(trimmed)
      : '';
  }

  removeCover(): void {
    this.coverFile = null;
    this.coverPreview = '';
    this.image_url = '';
  }

  save() {
    if (!this.title.trim()) {
      this.error = this.translate.instant('FORMATEUR.COURS_CREATE.MESSAGES.TITLE_REQUIRED');
      return;
    }

    const imageUrlInput = this.image_url.trim();
    const videoUrlInput = this.video_url.trim();

    if (imageUrlInput && !this.coverFile && !this.coursService.isValidImageReference(imageUrlInput)) {
      this.error = this.translate.instant('FORMATEUR.COURS_CREATE.MESSAGES.INVALID_IMAGE_URL');
      return;
    }

    if (videoUrlInput && !this.isValidUrl(videoUrlInput)) {
      this.error = this.translate.instant('FORMATEUR.COURS_CREATE.MESSAGES.INVALID_VIDEO_URL');
      return;
    }

    this.saving = true;
    this.error = '';

    const payload = this.buildPayload(
      this.coverFile ? undefined : imageUrlInput || undefined,
      videoUrlInput || undefined,
    );

    if (this.coverFile) {
      this.coursService.uploadCover(this.coverFile).pipe(
        switchMap((res) => this.coursService.create(this.buildPayload(res.image_url, videoUrlInput || undefined))),
      ).subscribe({
        next: () => this.router.navigate(['/formateur/cours']),
        error: (e) => this.handleSaveError(e),
      });
      return;
    }

    this.coursService.create(payload).subscribe({
      next: () => this.router.navigate(['/formateur/cours']),
      error: (e) => this.handleSaveError(e),
    });
  }

  private buildPayload(imageUrl?: string, videoUrl?: string): CourseCreate {
    return {
      title: this.title.trim(),
      description: this.description.trim() || undefined,
      category: this.category,
      level: this.level,
      duration: this.duration.trim() || undefined,
      image_url: this.coursService.normalizeImageUrlForSave(imageUrl),
      video_url: videoUrl?.trim() || undefined,
      content: this.content.trim() || undefined,
    };
  }

  private handleSaveError(e: { error?: { detail?: string } }): void {
    this.error = e.error?.detail || this.translate.instant('FORMATEUR.COURS_CREATE.MESSAGES.CREATE_ERROR');
    this.saving = false;
  }

  private isValidUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize, switchMap } from 'rxjs/operators';
import { CoursService, CourseDetail } from '../../core/services/cours';

interface CourseEditForm {
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  image_url: string;
  video_url: string;
  content: string;
  is_published: boolean;
}

@Component({
  selector: 'app-cours-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './cours-edit.html',
  styleUrl: './cours-edit.css',
})
export class CoursEdit implements OnInit {
  courseId = 0;
  course = signal<CourseDetail | null>(null);
  form: CourseEditForm = this.emptyForm();
  isLoading = signal(true);
  isSaving = signal(false);
  error = signal('');
  success = signal('');
  coverFile: File | null = null;
  coverPreview = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private coursService: CoursService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set(this.translate.instant('FORMATEUR.COURS_EDIT.MESSAGES.MISSING_ID'));
      this.isLoading.set(false);
      return;
    }

    this.courseId = id;
    this.coursService.manageGet(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (c) => {
          this.course.set(c);
          this.form = {
            title: c.title || '',
            description: c.description || '',
            category: c.category || 'general',
            level: c.level || 'debutant',
            duration: c.duration || '',
            image_url: c.image_url || '',
            video_url: c.video_url || '',
            content: c.content || '',
            is_published: c.is_published,
          };
          this.updateCoverPreview();
        },
        error: (err) => {
          const errorMsg = err.error?.detail
            || this.translate.instant('FORMATEUR.COURS_EDIT.MESSAGES.LOAD_ERROR', { status: err.statusText });
          this.error.set(errorMsg);
        },
      });
  }

  onCoverSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.error.set(this.translate.instant('FORMATEUR.COURS_CREATE.MESSAGES.INVALID_IMAGE'));
      return;
    }

    this.coverFile = file;
    this.form.image_url = '';
    this.error.set('');

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
    this.updateCoverPreview();
  }

  removeCover(): void {
    this.coverFile = null;
    this.coverPreview = '';
    this.form.image_url = '';
  }

  currentCoverSrc(): string {
    if (this.coverPreview) {
      return this.coverPreview;
    }
    return this.coursService.resolveImageUrl(this.form.image_url);
  }

  hasCoverPreview(): boolean {
    return !!this.coverPreview || !!this.coursService.resolveImageUrl(this.form.image_url);
  }

  save() {
    if (!this.form.title.trim()) {
      this.error.set(this.translate.instant('FORMATEUR.COURS_CREATE.MESSAGES.TITLE_REQUIRED'));
      return;
    }

    const imageUrlInput = this.form.image_url.trim();
    const videoUrlInput = this.form.video_url.trim();

    if (imageUrlInput && !this.coverFile && !this.coursService.isValidImageReference(imageUrlInput)) {
      this.error.set(this.translate.instant('FORMATEUR.COURS_CREATE.MESSAGES.INVALID_IMAGE_URL'));
      return;
    }

    if (videoUrlInput && !this.isValidUrl(videoUrlInput)) {
      this.error.set(this.translate.instant('FORMATEUR.COURS_CREATE.MESSAGES.INVALID_VIDEO_URL'));
      return;
    }

    this.isSaving.set(true);
    this.error.set('');
    this.success.set('');

    const updatePayload = {
      title: this.form.title.trim(),
      description: this.form.description.trim() || null,
      category: this.form.category,
      level: this.form.level,
      duration: this.form.duration.trim() || null,
      image_url: this.coverFile
        ? null
        : (this.coursService.normalizeImageUrlForSave(imageUrlInput) || null),
      video_url: videoUrlInput || null,
      content: this.form.content.trim() || null,
      is_published: this.form.is_published,
    };

    const save$ = this.coverFile
      ? this.coursService.uploadCover(this.coverFile).pipe(
        switchMap((res) => this.coursService.update(this.courseId, {
          ...updatePayload,
          image_url: res.image_url,
        })),
      )
      : this.coursService.update(this.courseId, updatePayload);

    save$
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: (updatedCourse) => {
          this.course.set(updatedCourse);
          this.form.image_url = updatedCourse.image_url || '';
          this.coverFile = null;
          this.updateCoverPreview();
          this.success.set(this.translate.instant('FORMATEUR.COURS_EDIT.MESSAGES.UPDATE_SUCCESS'));
          window.dispatchEvent(new Event('courseUpdated'));
          setTimeout(() => this.router.navigate(['/formateur/cours']), 2000);
        },
        error: (err) => {
          let errorMessage = this.translate.instant('FORMATEUR.COURS_EDIT.MESSAGES.UPDATE_ERROR');
          if (err.status === 403) {
            errorMessage = this.translate.instant('FORMATEUR.COURS_EDIT.MESSAGES.FORBIDDEN');
          } else if (err.status === 404) {
            errorMessage = this.translate.instant('FORMATEUR.COURS_EDIT.MESSAGES.NOT_FOUND');
          } else if (err.status === 401) {
            errorMessage = this.translate.instant('FORMATEUR.COURS_EDIT.MESSAGES.UNAUTHORIZED');
          } else if (err.error?.detail) {
            errorMessage = err.error.detail;
          }
          this.error.set(errorMessage);
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/formateur/dashboard']);
  }

  viewCourse(): void {
    if (this.courseId) {
      this.router.navigate(['/formateur/cours', this.courseId, 'voir'], {
        state: { cours: this.course() },
      });
    }
  }

  private emptyForm(): CourseEditForm {
    return {
      title: '',
      description: '',
      category: 'general',
      level: 'debutant',
      duration: '',
      image_url: '',
      video_url: '',
      content: '',
      is_published: false,
    };
  }

  private updateCoverPreview(): void {
    if (this.coverFile) {
      return;
    }
    const trimmed = this.form.image_url.trim();
    this.coverPreview = trimmed && this.coursService.isValidImageReference(trimmed)
      ? this.coursService.resolveImageUrl(trimmed)
      : '';
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

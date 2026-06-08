import { Component, signal, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AuthService, UserResponse } from '../../core/services/auth.service';
import { AvatarService } from '../../core/services/avatar.service';
import { environment } from '../../../environments/environment';
import { UseAvatarService } from '../../core/services/use-avatar.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  authService = inject(AuthService);
  avatarService = inject(AvatarService);
  avatarState = inject(UseAvatarService);
  private sanitizer = inject(DomSanitizer);
  private translate = inject(TranslateService);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  user = signal<UserResponse | null>(null);
  isLoading = signal(true);
  isSaving = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  // Avatar upload
  isUploadingAvatar = signal(false);
  avatarPreviewUrl = signal<string | null>(null);
  avatarPreviewFile = signal<File | null>(null);
  isAvatarDragOver = signal(false);
  avatarErrorMessage = signal('');
  avatarSuccessMessage = signal('');
  avatarToast = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  private avatarToastTimeout: ReturnType<typeof setTimeout> | null = null;

  // Change password
  showChangePassword = signal(false);
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  hideCurrentPassword = signal(true);
  hideNewPassword = signal(true);
  hideConfirmPassword = signal(true);
  passwordError = signal('');
  passwordSuccess = signal('');

  ngOnInit() {
    this.avatarState.initFromCacheAndSync().subscribe();
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading.set(true);
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.user.set(user);
        this.avatarState.setAvatar(user.avatar_url, false);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        const storedUser = this.authService.currentUser();
        if (storedUser) {
          this.user.set(storedUser);
        } else {
          this.errorMessage.set(err.message || this.translate.instant('APPRENANT.PROFILE.LOAD_ERROR'));
        }
      }
    });
  }

  toggleChangePassword() {
    this.showChangePassword.update(v => !v);
    this.passwordError.set('');
    this.passwordSuccess.set('');
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  onChangePassword() {
    this.passwordError.set('');

    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError.set(this.translate.instant('APPRENANT.PROFILE.REQUIRED_FIELDS'));
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError.set(this.translate.instant('APPRENANT.PROFILE.MISMATCH_ERROR'));
      return;
    }

    if (this.newPassword.length < 8) {
      this.passwordError.set(this.translate.instant('APPRENANT.PROFILE.PASSWORD_MIN_LENGTH'));
      return;
    }

    if (!/[A-Z]/.test(this.newPassword) || !/[a-z]/.test(this.newPassword) ||
      !/\d/.test(this.newPassword) || !/[!@#$%^&*()_+\-=\[\]{};':",./<>?]/.test(this.newPassword)) {
      this.passwordError.set(this.translate.instant('APPRENANT.PROFILE.PASSWORD_COMPLEXITY'));
      return;
    }

    this.isSaving.set(true);

    this.authService.changePassword({
      current_password: this.currentPassword,
      new_password: this.newPassword
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.passwordSuccess.set(this.translate.instant('APPRENANT.PROFILE.PASSWORD_CHANGED'));
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err) => {
        this.isSaving.set(false);
        this.passwordError.set(err.message || this.translate.instant('APPRENANT.PROFILE.PASSWORD_CHANGE_ERROR'));
      }
    });
  }

  getInitials(): string {
    const u = this.user();
    if (!u) return '?';
    if (u.full_name) {
      const parts = u.full_name.split(' ');
      return parts.map(p => p[0]).slice(0, 2).join('').toUpperCase();
    }
    return u.username.substring(0, 2).toUpperCase();
  }

  getMemberSince(): string {
    const u = this.user();
    if (!u?.created_at) return '';
    const date = new Date(u.created_at);
    const locale = this.translate.currentLang === 'ar' ? 'ar-TN' : 'fr-FR';
    return date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
  }

  getRoleBadge(): string {
    const role = this.user()?.role;
    switch (role) {
      case 'admin':
        return this.translate.instant('USERS.ROLE_ADMIN');
      case 'formateur':
        return this.translate.instant('USERS.ROLE_TRAINER');
      default:
        return this.translate.instant('USERS.ROLE_LEARNER');
    }
  }

  getRoleIcon(): string {
    const role = this.user()?.role;
    switch (role) {
      case 'admin': return 'fas fa-crown';
      case 'formateur': return 'fas fa-chalkboard-teacher';
      default: return 'fas fa-graduation-cap';
    }
  }

  // ===================== AVATAR MANAGEMENT =====================

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onAvatarDragOver(event: DragEvent) {
    event.preventDefault();
    this.isAvatarDragOver.set(true);
  }

  onAvatarDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isAvatarDragOver.set(false);
  }

  onAvatarDrop(event: DragEvent) {
    event.preventDefault();
    this.isAvatarDragOver.set(false);

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.prepareAvatarFile(file);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.prepareAvatarFile(file);
  }

  private prepareAvatarFile(file: File) {
    const validation = this.avatarService.validateImage(file);
    if (!validation.valid) {
      this.avatarErrorMessage.set(validation.error || this.translate.instant('APPRENANT.PROFILE.VALIDATION_ERROR'));
      this.showAvatarToast('error', validation.error || this.translate.instant('APPRENANT.PROFILE.INVALID_FILE'));
      return;
    }

    this.avatarPreviewFile.set(file);
    this.avatarErrorMessage.set('');

    this.avatarService.getImagePreview(file).then(preview => {
      this.avatarPreviewUrl.set(preview);
    }).catch(() => {
      this.avatarErrorMessage.set(this.translate.instant('APPRENANT.PROFILE.PREVIEW_ERROR'));
      this.showAvatarToast('error', this.translate.instant('APPRENANT.PROFILE.PREVIEW_ERROR'));
    });
  }

  cancelAvatarSelection() {
    this.avatarPreviewUrl.set(null);
    this.avatarPreviewFile.set(null);
    this.avatarErrorMessage.set('');

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  confirmAvatarUpload() {
    const file = this.avatarPreviewFile();
    if (!file) return;

    this.isUploadingAvatar.set(true);
    this.avatarErrorMessage.set('');
    this.avatarSuccessMessage.set('');

    this.avatarService.uploadAvatar(file).subscribe({
      next: (response) => {
        this.isUploadingAvatar.set(false);
        this.avatarSuccessMessage.set(this.translate.instant('APPRENANT.PROFILE.PHOTO_UPDATED'));

        if (this.user()) {
          const updated = { ...this.user()! };

          let avatarUrl = response.avatar_url;
          if (!avatarUrl.startsWith('http')) {
            avatarUrl = `${environment.apiUrl}${avatarUrl}`;
          }

          updated.avatar_url = avatarUrl;
          this.user.set(updated);
          this.authService.setCurrentUser(updated);
          this.avatarState.setAvatar(avatarUrl, false);
        }

        this.cancelAvatarSelection();
        this.showAvatarToast('success', this.translate.instant('APPRENANT.PROFILE.PHOTO_UPDATED'));
        setTimeout(() => this.avatarSuccessMessage.set(''), 3000);
      },
      error: (err) => {
        this.isUploadingAvatar.set(false);
        this.avatarErrorMessage.set(err.error?.detail || this.translate.instant('APPRENANT.PROFILE.PHOTO_UPLOAD_ERROR'));
        this.showAvatarToast('error', err.error?.detail || this.translate.instant('APPRENANT.PROFILE.PHOTO_UPLOAD_ERROR'));
      }
    });
  }

  deleteAvatar() {
    if (!confirm(this.translate.instant('APPRENANT.PROFILE.DELETE_AVATAR_CONFIRM'))) {
      return;
    }

    this.isUploadingAvatar.set(true);
    this.avatarErrorMessage.set('');
    this.avatarSuccessMessage.set('');

    this.avatarService.deleteAvatar().subscribe({
      next: () => {
        this.isUploadingAvatar.set(false);
        this.avatarSuccessMessage.set(this.translate.instant('APPRENANT.PROFILE.PHOTO_DELETED'));

        if (this.user()) {
          const updated = { ...this.user()! };
          updated.avatar_url = null;
          this.user.set(updated);
          this.authService.setCurrentUser(updated);
          this.avatarState.clearAvatar(false);
        }

        this.cancelAvatarSelection();
        this.showAvatarToast('success', this.translate.instant('APPRENANT.PROFILE.PHOTO_DELETED'));
        setTimeout(() => this.avatarSuccessMessage.set(''), 3000);
      },
      error: (err) => {
        this.isUploadingAvatar.set(false);
        this.avatarErrorMessage.set(err.message || this.translate.instant('APPRENANT.PROFILE.PHOTO_DELETE_ERROR'));
        this.showAvatarToast('error', err.message || this.translate.instant('APPRENANT.PROFILE.PHOTO_DELETE_ERROR'));
      }
    });
  }

  getAvatarDisplay(): SafeUrl | null {
    const avatarUrl = this.avatarPreviewUrl() || this.avatarState.avatarUrl() || this.user()?.avatar_url;
    if (!avatarUrl) return null;

    if (avatarUrl.startsWith('http')) {
      return this.sanitizer.bypassSecurityTrustUrl(avatarUrl);
    }

    if (avatarUrl.startsWith('/')) {
      const fullUrl = `${environment.apiUrl}${avatarUrl}`;
      return this.sanitizer.bypassSecurityTrustUrl(fullUrl);
    }
    
    return null;
  }

  onImageLoadError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const initialsDiv = img.parentElement?.querySelector('.avatar-initials-fallback');
    if (initialsDiv) {
      (initialsDiv as HTMLElement).style.display = 'flex';
    }
  }

  onImageLoadSuccess(event: Event): void {
    const img = event.target as HTMLImageElement;
    const initialsDiv = img.parentElement?.querySelector('.avatar-initials-fallback');
    if (initialsDiv) {
      (initialsDiv as HTMLElement).style.display = 'none';
    }
  }

  private showAvatarToast(type: 'success' | 'error', text: string) {
    if (this.avatarToastTimeout) {
      clearTimeout(this.avatarToastTimeout);
    }

    this.avatarToast.set({ type, text });
    this.avatarToastTimeout = setTimeout(() => {
      this.avatarToast.set(null);
    }, 3000);
  }

  getUserInitials(): string {
    return this.getInitials();
  }

  getFirstName(): string {
    const fullName = this.user()?.full_name?.trim();
    if (!fullName) {
      return '';
    }

    return fullName.split(/\s+/)[0] || '';
  }

  getLastName(): string {
    const fullName = this.user()?.full_name?.trim();
    if (!fullName) {
      return '';
    }

    const parts = fullName.split(/\s+/);
    if (parts.length < 2) {
      return '';
    }

    return parts.slice(1).join(' ');
  }
}

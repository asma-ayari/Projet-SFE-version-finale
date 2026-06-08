import { Component, signal, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AuthService, UserResponse } from '../../core/services/auth.service';
import { AvatarService } from '../../core/services/avatar.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  authService = inject(AuthService);
  avatarService = inject(AvatarService);
  private sanitizer = inject(DomSanitizer);

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
    this.avatarService.initForCurrentUser();
    this.loadProfile();
  }

  loadProfile() {
    this.isLoading.set(true);
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.user.set(user);
        if (user?.id) {
          this.avatarService.setAvatarForUser(user.avatar_url, user.id);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        const storedUser = this.authService.currentUser();
        if (storedUser) {
          this.user.set(storedUser);
        } else {
          this.errorMessage.set(err.message || 'Erreur de chargement du profil');
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
      this.passwordError.set('Veuillez remplir tous les champs');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError.set('Les mots de passe ne correspondent pas');
      return;
    }

    if (this.newPassword.length < 8) {
      this.passwordError.set('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (!/[A-Z]/.test(this.newPassword) || !/[a-z]/.test(this.newPassword) ||
      !/\d/.test(this.newPassword) || !/[!@#$%^&*()_+\-=\[\]{};':",./<>?]/.test(this.newPassword)) {
      this.passwordError.set('Majuscule, minuscule, chiffre et caractère spécial requis');
      return;
    }

    this.isSaving.set(true);

    this.authService.changePassword({
      current_password: this.currentPassword,
      new_password: this.newPassword
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.passwordSuccess.set('Mot de passe modifié avec succès !');
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
      },
      error: (err) => {
        this.isSaving.set(false);
        this.passwordError.set(err.message || 'Erreur lors du changement de mot de passe');
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
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  getRoleBadge(): string {
    const role = this.user()?.role;
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'formateur': return 'Formateur';
      default: return 'Apprenant';
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
      this.avatarErrorMessage.set(validation.error || 'Erreur de validation');
      this.showAvatarToast('error', validation.error || 'Fichier invalide');
      return;
    }

    this.avatarPreviewFile.set(file);
    this.avatarErrorMessage.set('');

    this.avatarService.getImagePreview(file).then(preview => {
      this.avatarPreviewUrl.set(preview);
    }).catch(() => {
      this.avatarErrorMessage.set('Erreur lors du chargement de l\'aperçu');
      this.showAvatarToast('error', 'Erreur lors du chargement de l\'aperçu');
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
        this.avatarSuccessMessage.set('Avatar mis à jour avec succès !');

        // AvatarService updated avatar and local cache; refresh server profile
        this.authService.getProfile().subscribe();

        this.cancelAvatarSelection();
        this.showAvatarToast('success', 'Photo mise à jour ✓');
        setTimeout(() => this.avatarSuccessMessage.set(''), 3000);
      },
      error: (err) => {
        this.isUploadingAvatar.set(false);
        this.avatarErrorMessage.set(err.error?.detail || 'Erreur lors du téléchargement de l\'avatar');
        this.showAvatarToast('error', err.error?.detail || 'Erreur lors du téléchargement de l\'avatar');
      }
    });
  }

  deleteAvatar() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre avatar ?')) {
      return;
    }

    this.isUploadingAvatar.set(true);
    this.avatarErrorMessage.set('');
    this.avatarSuccessMessage.set('');

    this.avatarService.deleteAvatar().subscribe({
      next: () => {
        this.isUploadingAvatar.set(false);
        this.avatarSuccessMessage.set('Avatar supprimé');

        // AvatarService cleared cache and updated authService; refresh profile
        this.authService.getProfile().subscribe();

        this.cancelAvatarSelection();
        this.showAvatarToast('success', 'Photo supprimée ✓');
        setTimeout(() => this.avatarSuccessMessage.set(''), 3000);
      },
      error: (err) => {
        this.isUploadingAvatar.set(false);
        this.avatarErrorMessage.set(err.message || 'Erreur lors de la suppression de l\'avatar');
        this.showAvatarToast('error', err.message || 'Erreur lors de la suppression de l\'avatar');
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
}

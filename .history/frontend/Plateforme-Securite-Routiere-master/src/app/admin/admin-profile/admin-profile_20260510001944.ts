import { Component, signal, inject, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, UserResponse } from '../../core/services/auth.service';
import { AvatarService } from '../../core/services/avatar.service';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil, timeout, finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './admin-profile.html',
  styleUrl: './admin-profile.css'
})
export class AdminProfile implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private avatarService = inject(AvatarService);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private translate = inject(TranslateService);

  private destroy$ = new Subject<void>();
  private apiUrl = `${environment.apiUrl}/api/users`;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  currentUser = signal<UserResponse | null>(null);
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  loading = signal(false);
  successMessage = signal('');
  errorMessage = signal('');
  profilePhotoPreview = signal<string | null>(null);
  fileInputValue = signal<string>('');

  // Enhanced UX signals
  pendingFile = signal<File | null>(null);
  isDragOver = signal(false);
  uploading = signal(false);
  toastMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  private toastTimeout: any = null;

  ngOnInit(): void {
    this.loadUserProfile();
    this.initializeForms();
    this.refreshProfileFromAPI();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
  }

  // ========================================
  // PROFILE LOADING & PERSISTENCE
  // ========================================

  /** Load user from AuthService signal (localStorage cache) */
  private loadUserProfile(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.currentUser.set(user);
      if (user.avatar_url) {
        this.profilePhotoPreview.set(user.avatar_url);
      }
    }
  }

  /** Refresh profile from API to fix persistence after reload */
  private refreshProfileFromAPI(): void {
    this.authService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user) => {
          this.currentUser.set(user);
          if (user.avatar_url) {
            this.profilePhotoPreview.set(user.avatar_url);
          } else {
            this.profilePhotoPreview.set(null);
          }
          // Update form with fresh data
          this.profileForm.patchValue({
            full_name: user.full_name || '',
            email: user.email || '',
            role: user.role || ''
          });
        },
        error: (err) => {
          console.warn('Could not refresh profile from API, using cached data:', err);
        }
      });
  }

  private initializeForms(): void {
    const user = this.currentUser();

    this.profileForm = this.fb.group({
      full_name: [user?.full_name || '', [Validators.required, Validators.minLength(2)]],
      email: [{ value: user?.email || '', disabled: true }],
      phone: ['', [Validators.pattern(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)]],
      role: [{ value: user?.role || '', disabled: true }]
    });

    this.passwordForm = this.fb.group({
      current_password: ['', [Validators.required, Validators.minLength(6)]],
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', [Validators.required, Validators.minLength(6)]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(form: FormGroup): { [key: string]: any } | null {
    const newPassword = form.get('new_password')?.value;
    const confirmPassword = form.get('confirm_password')?.value;
    return newPassword && confirmPassword && newPassword !== confirmPassword
      ? { passwordMismatch: true }
      : null;
  }

  // ========================================
  // DRAG & DROP
  // ========================================

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  // ========================================
  // FILE SELECTION & PREVIEW
  // ========================================

  onProfilePhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.handleFileSelection(input.files[0]);
    }
  }

  private handleFileSelection(file: File): void {
    // Validate using AvatarService
    const validation = this.avatarService.validateImage(file);
    if (!validation.valid) {
      this.showToast('error', validation.error || this.translate.instant('ADMIN.PROFILE.INVALID_FILE'));
      return;
    }

    // Set as pending (preview before confirmation)
    this.pendingFile.set(file);

    // Generate instant preview
    this.avatarService.getImagePreview(file).then(preview => {
      this.profilePhotoPreview.set(preview);
    }).catch(() => {
      this.showToast('error', this.translate.instant('ADMIN.PROFILE.PREVIEW_ERROR'));
    });
  }

  // ========================================
  // UPLOAD ACTIONS
  // ========================================

  confirmUpload(): void {
    const file = this.pendingFile();
    if (!file) return;

    this.uploading.set(true);
    this.loading.set(true);

    this.avatarService.uploadAvatar(file)
      .pipe(
        timeout(30000),
        takeUntil(this.destroy$),
        finalize(() => {
          this.uploading.set(false);
          this.loading.set(false);
          this.pendingFile.set(null);
          this.resetPhotoInput();
        })
      )
      .subscribe({
        next: (response) => {
          let avatarUrl = response.avatar_url;
          if (!avatarUrl.startsWith('http')) {
            avatarUrl = `${environment.apiUrl}${avatarUrl}`;
          }
          // Update user state globally → header & sidebar update automatically
          const updatedUser = { ...this.currentUser() as UserResponse, avatar_url: avatarUrl };
          this.currentUser.set(updatedUser);
          this.authService.setCurrentUser(updatedUser);
          this.profilePhotoPreview.set(avatarUrl);
          this.showToast('success', this.translate.instant('ADMIN.PROFILE.PHOTO_UPDATED'));
        },
        error: (error) => {
          console.error('Photo upload error:', error);
          // Revert preview
          const currentAvatar = this.currentUser()?.avatar_url || null;
          this.profilePhotoPreview.set(currentAvatar);
          this.showToast('error', this.translate.instant('ADMIN.PROFILE.PHOTO_UPLOAD_ERROR'));
        }
      });
  }

  cancelUpload(): void {
    this.pendingFile.set(null);
    // Revert preview to current avatar
    const currentAvatar = this.currentUser()?.avatar_url || null;
    this.profilePhotoPreview.set(currentAvatar);
    this.resetPhotoInput();
  }

  deletePhoto(): void {
    this.loading.set(true);
    this.avatarService.deleteAvatar()
      .pipe(
        timeout(10000),
        takeUntil(this.destroy$),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: () => {
          const updatedUser = { ...this.currentUser() as UserResponse, avatar_url: null };
          this.currentUser.set(updatedUser);
          this.authService.setCurrentUser(updatedUser);
          this.profilePhotoPreview.set(null);
          this.showToast('success', this.translate.instant('ADMIN.PROFILE.PHOTO_DELETED'));
        },
        error: (error) => {
          console.error('Delete avatar error:', error);
          this.showToast('error', this.translate.instant('ADMIN.PROFILE.PHOTO_DELETE_ERROR'));
        }
      });
  }

  // ========================================
  // TOAST NOTIFICATIONS
  // ========================================

  showToast(type: 'success' | 'error', text: string): void {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastMessage.set({ type, text });
    this.toastTimeout = setTimeout(() => this.toastMessage.set(null), 4000);
  }

  dismissToast(): void {
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastMessage.set(null);
  }

  // ========================================
  // FILE INPUT HELPERS
  // ========================================

  triggerFileInput(): void {
    if (this.fileInput) {
      this.fileInput.nativeElement.click();
    } else {
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (input) input.click();
    }
  }

  private resetPhotoInput(): void {
    this.fileInputValue.set('');
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // ========================================
  // PROFILE FORM
  // ========================================

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.showToast('error', this.translate.instant('ADMIN.PROFILE.FORM_ERRORS'));
      return;
    }

    this.loading.set(true);
    const formData = this.profileForm.value;

    this.http.put<UserResponse>(`${this.apiUrl}/profile`, formData)
      .pipe(
        timeout(10000),
        takeUntil(this.destroy$),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response) => {
          this.currentUser.set(response);
          this.authService.setCurrentUser(response);
          this.profileForm.patchValue(response);
          this.showToast('success', this.translate.instant('ADMIN.PROFILE.PROFILE_UPDATED'));
        },
        error: (error) => {
          console.error('Profile update error:', error);
          this.showToast('error', error.error?.detail || this.translate.instant('ADMIN.PROFILE.PROFILE_UPDATE_ERROR'));
        }
      });
  }

  // ========================================
  // PASSWORD FORM
  // ========================================

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.showToast('error', this.translate.instant('ADMIN.PROFILE.FORM_ERRORS'));
      return;
    }

    this.loading.set(true);
    const passwordData = {
      current_password: this.passwordForm.get('current_password')?.value,
      new_password: this.passwordForm.get('new_password')?.value
    };

    this.http.put(`${this.apiUrl}/change-password`, passwordData)
      .pipe(
        timeout(10000),
        takeUntil(this.destroy$),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: () => {
          this.showToast('success', this.translate.instant('ADMIN.PROFILE.PASSWORD_CHANGED'));
          this.passwordForm.reset();
        },
        error: (error) => {
          console.error('Password change error:', error);
          this.showToast('error', error.error?.detail || this.translate.instant('ADMIN.PROFILE.PASSWORD_CHANGE_ERROR'));
        }
      });
  }

  // ========================================
  // UTILITY
  // ========================================

  getUserInitials(): string {
    const user = this.currentUser();
    if (!user) return 'A';
    if (user.full_name) {
      const names = user.full_name.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user.username ? user.username[0].toUpperCase() : 'A';
  }

  get passwordMismatch(): boolean {
    return this.passwordForm.hasError('passwordMismatch');
  }
}

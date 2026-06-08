import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import { PlatformLogo } from '../../shared/platform-logo/platform-logo';
import { PlatformBrandName } from '../../shared/platform-brand-name/platform-brand-name';

@Component({
  selector: 'app-register',
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    TranslateModule,
    PlatformLogo,
    PlatformBrandName,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  acceptTerms = false;
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  isLoading = signal(false);
  errorMessage = signal('');

  togglePasswordVisibility() {
    this.hidePassword.update(v => !v);
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword.update(v => !v);
  }

  onSubmit() {
    if (this.firstName && this.lastName && this.email && this.password && this.confirmPassword && this.acceptTerms) {
      if (this.password !== this.confirmPassword) {
        this.errorMessage.set(this.translate.instant('AUTH.ERRORS.PASSWORD_MISMATCH'));
        return;
      }

      // Client-side password validation (matching backend A2 rules)
      if (this.password.length < 8) {
        this.errorMessage.set(this.translate.instant('AUTH.ERRORS.PASSWORD_MIN'));
        return;
      }
      if (!/[A-Z]/.test(this.password)) {
        this.errorMessage.set(this.translate.instant('AUTH.ERRORS.PASSWORD_UPPER'));
        return;
      }
      if (!/[a-z]/.test(this.password)) {
        this.errorMessage.set(this.translate.instant('AUTH.ERRORS.PASSWORD_LOWER'));
        return;
      }
      if (!/\d/.test(this.password)) {
        this.errorMessage.set(this.translate.instant('AUTH.ERRORS.PASSWORD_DIGIT'));
        return;
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':",./<>?]/.test(this.password)) {
        this.errorMessage.set(this.translate.instant('AUTH.ERRORS.PASSWORD_SPECIAL'));
        return;
      }

      this.isLoading.set(true);
      this.errorMessage.set('');

      const fullName = `${this.firstName} ${this.lastName}`.trim();
      // Use email prefix as username if no username field
      const username = this.email.split('@')[0] + Math.floor(Math.random() * 1000);

      this.authService.register({
        username: username,
        email: this.email,
        password: this.password,
        full_name: fullName,
      }).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          // Redirection dynamique selon le rôle de l'utilisateur
          const role = response.user?.role || 'apprenant';
          this.router.navigate([`/${role}/dashboard`]);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message || this.translate.instant('AUTH.ERRORS.REGISTER_ERROR'));
        }
      });
    }
  }

  onGoogleRegister() {
    const google = (window as any).google;
    if (!google?.accounts?.id) {
      this.errorMessage.set(this.translate.instant('AUTH.ERRORS.GOOGLE_LOADING'));
      return;
    }
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => {
        this.isLoading.set(true);
        this.errorMessage.set('');
        this.authService.googleAuth(response.credential).subscribe({
          next: (res) => {
            this.isLoading.set(false);
            const role = res.user?.role || 'apprenant';
            this.router.navigate([`/${role}/dashboard`]);
          },
          error: (err) => {
            this.isLoading.set(false);
            this.errorMessage.set(err.message || this.translate.instant('AUTH.ERRORS.GOOGLE_ERROR'));
          }
        });
      }
    });
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        const btnContainer = document.getElementById('google-btn-container');
        if (btnContainer) {
          btnContainer.innerHTML = '';
          google.accounts.id.renderButton(btnContainer, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signup_with',
          });
        }
      }
    });
  }
}

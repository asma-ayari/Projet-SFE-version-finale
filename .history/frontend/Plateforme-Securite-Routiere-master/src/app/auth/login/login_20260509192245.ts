import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    TranslateModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  email = '';
  password = '';
  rememberMe = false;
  hidePassword = signal(true);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  togglePasswordVisibility() {
    this.hidePassword.update(v => !v);
  }

  onSubmit() {
    if (this.email && this.password) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      this.authService.login({ email: this.email, password: this.password }).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          // Redirection dynamique selon le rôle de l'utilisateur
          const role = response.user?.role || 'apprenant';
          this.router.navigate([`/${role}/dashboard`]);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.message || this.translate.instant('AUTH.ERRORS.INVALID_CREDENTIALS'));
        }
      });
    }
  }

  onGoogleLogin() {
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
        // Fallback: render a Google button
        const btnContainer = document.getElementById('google-btn-container');
        if (btnContainer) {
          btnContainer.innerHTML = '';
          google.accounts.id.renderButton(btnContainer, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
          });
        }
      }
    });
  }
}

import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { PlatformLogo } from '../../shared/platform-logo/platform-logo';
import { PlatformBrandName } from '../../shared/platform-brand-name/platform-brand-name';

@Component({
    selector: 'app-forgot-password',
    imports: [CommonModule, RouterLink, FormsModule, TranslateModule, PlatformLogo, PlatformBrandName],
    templateUrl: './forgot-password.html',
    styleUrl: './forgot-password.css',
})
export class ForgotPassword {
    private authService = inject(AuthService);
    private router = inject(Router);
    private translate = inject(TranslateService);

    email = '';
    isLoading = signal(false);
    errorMessage = signal('');
    successMessage = signal('');

    onSubmit() {
        if (!this.email.trim()) {
            this.errorMessage.set(this.translate.instant('AUTH.ERRORS.EMAIL_REQUIRED'));
            return;
        }

        this.isLoading.set(true);
        this.errorMessage.set('');
        this.successMessage.set('');

        this.authService.forgotPassword(this.email).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.successMessage.set(this.translate.instant('AUTH.ERRORS.RESET_CODE_SENT'));
                // Navigate to reset password page after a short delay
                setTimeout(() => {
                    this.router.navigate(['/auth/reset-password'], { queryParams: { email: this.email } });
                }, 2000);
            },
            error: (err) => {
                this.isLoading.set(false);
                this.errorMessage.set(err.message || this.translate.instant('AUTH.ERRORS.SEND_CODE_ERROR'));
            }
        });
    }
}

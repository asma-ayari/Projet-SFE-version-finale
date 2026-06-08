import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { PlatformLogo } from '../../shared/platform-logo/platform-logo';
import { PlatformBrandName } from '../../shared/platform-brand-name/platform-brand-name';

@Component({
    selector: 'app-reset-password',
    imports: [CommonModule, RouterLink, FormsModule, TranslateModule, PlatformLogo, PlatformBrandName],
    templateUrl: './reset-password.html',
    styleUrl: './reset-password.css',
})
export class ResetPassword implements OnInit {
    private authService = inject(AuthService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private translate = inject(TranslateService);

    email = '';
    code = '';
    newPassword = '';
    confirmPassword = '';
    hidePassword = signal(true);
    hideConfirm = signal(true);
    isLoading = signal(false);
    errorMessage = signal('');
    successMessage = signal('');

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params['email']) {
                this.email = params['email'];
            }
        });
    }

    togglePasswordVisibility() {
        this.hidePassword.update(v => !v);
    }

    toggleConfirmVisibility() {
        this.hideConfirm.update(v => !v);
    }

    onSubmit() {
        this.errorMessage.set('');

        if (!this.email || !this.code || !this.newPassword || !this.confirmPassword) {
            this.errorMessage.set(this.translate.instant('AUTH.ERRORS.FILL_ALL_FIELDS'));
            return;
        }

        if (this.newPassword !== this.confirmPassword) {
            this.errorMessage.set(this.translate.instant('AUTH.ERRORS.PASSWORD_MISMATCH'));
            return;
        }

        if (this.newPassword.length < 8) {
            this.errorMessage.set(this.translate.instant('AUTH.ERRORS.PASSWORD_MIN'));
            return;
        }

        if (!/[A-Z]/.test(this.newPassword) || !/[a-z]/.test(this.newPassword) ||
            !/\d/.test(this.newPassword) || !/[!@#$%^&*()_+\-=\[\]{};':",./<>?]/.test(this.newPassword)) {
            this.errorMessage.set(this.translate.instant('AUTH.ERRORS.PASSWORD_COMPLEXITY'));
            return;
        }

        this.isLoading.set(true);

        this.authService.resetPassword({
            email: this.email,
            code: this.code,
            new_password: this.newPassword
        }).subscribe({
            next: () => {
                this.isLoading.set(false);
                this.successMessage.set(this.translate.instant('AUTH.ERRORS.RESET_SUCCESS'));
                setTimeout(() => {
                    this.router.navigate(['/auth/login']);
                }, 2000);
            },
            error: (err) => {
                this.isLoading.set(false);
                this.errorMessage.set(err.message || this.translate.instant('AUTH.ERRORS.CODE_INVALID'));
            }
        });
    }
}

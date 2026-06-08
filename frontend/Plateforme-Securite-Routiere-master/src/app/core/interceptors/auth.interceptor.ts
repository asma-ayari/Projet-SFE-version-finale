import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
    const authService = inject(AuthService);

    // Don't add token to auth endpoints (except /me and /change-password)
    const isAuthEndpoint =
        req.url.includes('/api/auth/login') ||
        req.url.includes('/api/auth/register') ||
        req.url.includes('/api/auth/google') ||
        req.url.includes('/api/auth/refresh') ||
        req.url.includes('/api/auth/forgot-password') ||
        req.url.includes('/api/auth/reset-password');

    if (isAuthEndpoint) {
        return next(req);
    }

    const token = authService.getAccessToken();
    let authReq = req;

    if (token) {
        authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // If 401 and we have a token, try refreshing
            if (error.status === 401 && token && !req.url.includes('/api/auth/refresh')) {
                return authService.refreshToken().pipe(
                    switchMap(() => {
                        const newToken = authService.getAccessToken();
                        const retryReq = req.clone({
                            setHeaders: {
                                Authorization: `Bearer ${newToken}`,
                            },
                        });
                        return next(retryReq);
                    }),
                    catchError((refreshError) => {
                        authService.logout();
                        return throwError(() => refreshError);
                    })
                );
            }
            return throwError(() => error);
        })
    );
};

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

// --- Interfaces matching backend schemas ---

export interface UserResponse {
    id: number;
    username: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    auth_provider: string;
    is_active: boolean;
    role: string;
    created_at: string;
}

export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    user: UserResponse;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    full_name?: string;
}

export interface ChangePasswordRequest {
    current_password: string;
    new_password: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    email: string;
    code: string;
    new_password: string;
}

export interface GoogleAuthRequest {
    credential: string;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/api/auth`;

    // Reactive state
    private _currentUser = signal<UserResponse | null>(null);
    private _isAuthenticated = signal(false);
    private refreshTimeout: any = null;

    readonly currentUser = this._currentUser.asReadonly();
    readonly isAuthenticated = this._isAuthenticated.asReadonly();

    constructor(private http: HttpClient, private router: Router) {
        this.loadFromStorage();
    }

    // --- Public Auth Methods ---

    login(request: LoginRequest): Observable<TokenResponse> {
        return this.http.post<TokenResponse>(`${this.apiUrl}/login`, request).pipe(
            tap((response) => this.handleAuthSuccess(response)),
            catchError((error) => this.handleAuthError(error))
        );
    }

    register(request: RegisterRequest): Observable<TokenResponse> {
        return this.http.post<TokenResponse>(`${this.apiUrl}/register`, request).pipe(
            tap((response) => this.handleAuthSuccess(response)),
            catchError((error) => this.handleAuthError(error))
        );
    }

    googleAuth(credential: string): Observable<TokenResponse> {
        return this.http
            .post<TokenResponse>(`${this.apiUrl}/google`, { credential })
            .pipe(
                tap((response) => this.handleAuthSuccess(response)),
                catchError((error) => this.handleAuthError(error))
            );
    }

    refreshToken(): Observable<TokenResponse> {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            return throwError(() => new Error('No refresh token'));
        }
        return this.http
            .post<TokenResponse>(`${this.apiUrl}/refresh`, {
                refresh_token: refreshToken,
            })
            .pipe(
                tap((response) => this.handleAuthSuccess(response)),
                catchError((error) => {
                    this.logout();
                    return throwError(() => error);
                })
            );
    }

    changePassword(request: ChangePasswordRequest): Observable<any> {
        return this.http.put(`${this.apiUrl}/change-password`, request).pipe(
            catchError((error) => this.handleAuthError(error))
        );
    }

    forgotPassword(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/forgot-password`, { email }).pipe(
            catchError((error) => this.handleAuthError(error))
        );
    }

    resetPassword(request: ResetPasswordRequest): Observable<any> {
        return this.http.post(`${this.apiUrl}/reset-password`, request).pipe(
            catchError((error) => this.handleAuthError(error))
        );
    }

    getProfile(): Observable<UserResponse> {
        return this.http.get<UserResponse>(`${this.apiUrl}/me`).pipe(
            tap((user) => {
                // Construire l'URL complète pour l'avatar si nécessaire
                if (user.avatar_url && !user.avatar_url.startsWith('http')) {
                    user.avatar_url = `${environment.apiUrl}${user.avatar_url}`;
                }
                this._currentUser.set(user);
                localStorage.setItem('user', JSON.stringify(user));
            }),
            catchError((error) => this.handleAuthError(error))
        );
    }

    /**
     * Mettre à jour l'utilisateur courant (utilisé après les mises à jour de profil)
     */
    setCurrentUser(user: UserResponse): void {
        // Construire l'URL complète pour l'avatar si nécessaire
        if (user.avatar_url && !user.avatar_url.startsWith('http')) {
            user.avatar_url = `${environment.apiUrl}${user.avatar_url}`;
        }
        this._currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));
    }

    logout(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('avatar_url_cache');
        this._currentUser.set(null);
        this._isAuthenticated.set(false);
        this.clearRefreshSchedule();
        // La redirection est gérée par le composant appelant (ex: header.ts)
    }

    // --- Token Helpers ---

    getAccessToken(): string | null {
        return localStorage.getItem('access_token');
    }

    isTokenExpired(): boolean {
        const token = this.getAccessToken();
        if (!token) return true;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 < Date.now();
        } catch {
            return true;
        }
    }

    // --- Private Methods ---

    private handleAuthSuccess(response: TokenResponse): void {
        // Construire l'URL complète pour l'avatar si nécessaire
        if (response.user.avatar_url && !response.user.avatar_url.startsWith('http')) {
            response.user.avatar_url = `${environment.apiUrl}${response.user.avatar_url}`;
        }
        localStorage.setItem('access_token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this._currentUser.set(response.user);
        this._isAuthenticated.set(true);
        this.scheduleTokenRefresh(response.expires_in);
    }

    private handleAuthError(error: any): Observable<never> {
        let message = 'Une erreur est survenue';
        if (error.error?.detail) {
            message = error.error.detail;
        } else if (error.status === 0) {
            message = 'Impossible de contacter le serveur';
        } else if (error.status === 429) {
            message = 'Trop de tentatives. Réessayez plus tard.';
        }
        return throwError(() => ({ message, status: error.status, original: error }));
    }

    private loadFromStorage(): void {
        const token = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
            try {
                const user = JSON.parse(userStr) as UserResponse;
                // Construire l'URL complète pour l'avatar si nécessaire
                if (user.avatar_url && !user.avatar_url.startsWith('http')) {
                    user.avatar_url = `${environment.apiUrl}${user.avatar_url}`;
                }
                this._currentUser.set(user);
                this._isAuthenticated.set(true);

                // Check if token expired
                if (this.isTokenExpired()) {
                    this.refreshToken().subscribe({
                        error: () => this.logout(),
                    });
                } else {
                    // Schedule refresh
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const expiresIn = payload.exp - Math.floor(Date.now() / 1000);
                    this.scheduleTokenRefresh(expiresIn);
                }
            } catch {
                this.logout();
            }
        }
    }

    private scheduleTokenRefresh(expiresInSeconds: number): void {
        this.clearRefreshSchedule();
        // Refresh 60 seconds before expiry
        const refreshIn = Math.max((expiresInSeconds - 60) * 1000, 10000);
        this.refreshTimeout = setTimeout(() => {
            this.refreshToken().subscribe();
        }, refreshIn);
    }

    private clearRefreshSchedule(): void {
        if (this.refreshTimeout) {
            clearTimeout(this.refreshTimeout);
            this.refreshTimeout = null;
        }
    }
}

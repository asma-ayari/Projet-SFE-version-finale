import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../core/services/auth.service';
import { UseAvatarService } from '../../core/services/use-avatar.service';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  authService = inject(AuthService);
  avatarState = inject(UseAvatarService);
  private router = inject(Router);
  isMenuOpen = signal(false);

  ngOnInit() {
    if (this.authService.currentUser()) {
      this.avatarState.initFromCacheAndSync().subscribe();
    }
  }

  get isAuthenticated() {
    return this.authService.isAuthenticated;
  }

  get currentUser() {
    return this.authService.currentUser;
  }

  toggleMenu() {
    this.isMenuOpen.update(v => !v);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getDashboardRoute(): string {
    const user = this.authService.currentUser();
    if (!user) return '/auth/login';
    switch (user.role) {
      case 'admin': return '/admin/dashboard';
      case 'formateur': return '/formateur/dashboard';
      default: return '/apprenant/dashboard';
    }
  }

  /**
   * Obtient l'URL de l'avatar de l'utilisateur
   */
  getUserAvatarUrl(): string | null {
    const avatarUrl = this.avatarState.avatarUrl() || this.authService.currentUser()?.avatar_url;
    if (!avatarUrl) return null;

    if (avatarUrl.startsWith('http')) {
      return avatarUrl;
    }

    if (avatarUrl.startsWith('/')) {
      return avatarUrl;
    }

    return null;
  }

  /**
   * Obtient les initiales de l'utilisateur
   */
  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return '?';
    if (user.full_name) {
      const parts = user.full_name.split(' ');
      return parts.map(p => p[0]).slice(0, 2).join('').toUpperCase();
    }
    return user.username.substring(0, 2).toUpperCase();
  }

  /**
   * Obtient le nom d'affichage de l'utilisateur
   */
  getUserDisplayName(): string {
    const user = this.authService.currentUser();
    if (!user) return '';
    return user.full_name || user.username;
  }
}

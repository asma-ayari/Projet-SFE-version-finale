import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router, RouterLinkActive } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { DOCUMENT } from '@angular/common';

interface NavItem {
  labelKey: string;
  icon: string;
  route: string;
  badge?: string;
  tooltipKey?: string;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive, TranslateModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private document = inject(DOCUMENT);
  private translate = inject(TranslateService);

  isSidebarOpen = signal(true);
  private readonly SIDEBAR_STATE_KEY = 'admin-sidebar-state';

  ngOnInit(): void {
    this.loadSidebarState();
    this.applyBodyClasses();
  }

  ngOnDestroy(): void {
    this.removeBodyClasses();
  }

  private loadSidebarState(): void {
    const savedState = localStorage.getItem(this.SIDEBAR_STATE_KEY);
    if (savedState !== null) {
      this.isSidebarOpen.set(savedState === 'open');
    }
  }

  private applyBodyClasses(): void {
    const body = this.document.body;
    body.classList.add('admin-layout-active');
    body.classList.toggle('admin-sidebar-collapsed', !this.isSidebarOpen());
    body.classList.toggle('admin-sidebar-expanded', this.isSidebarOpen());
  }

  private removeBodyClasses(): void {
    const body = this.document.body;
    body.classList.remove('admin-layout-active', 'admin-sidebar-collapsed', 'admin-sidebar-expanded');
  }

  private saveSidebarState(): void {
    const state = this.isSidebarOpen() ? 'open' : 'closed';
    localStorage.setItem(this.SIDEBAR_STATE_KEY, state);
  }

  navItems: NavItem[] = [
    {
      labelKey: 'ADMIN.SIDEBAR.DASHBOARD',
      icon: 'fas fa-chart-pie',
      route: '/admin/dashboard',
      tooltipKey: 'ADMIN.SIDEBAR.DASHBOARD'
    },
    {
      labelKey: 'ADMIN.SIDEBAR.USERS',
      icon: 'fas fa-users',
      route: '/admin/users',
      tooltipKey: 'ADMIN.SIDEBAR.USERS'
    },
    {
      labelKey: 'ADMIN.SIDEBAR.QCM',
      icon: 'fas fa-clipboard-list',
      route: '/admin/qcm',
      tooltipKey: 'ADMIN.SIDEBAR.QCM'
    },
    {
      labelKey: 'ADMIN.SIDEBAR.QCM_CATEGORIES',
      icon: 'fas fa-tags',
      route: '/admin/qcm/categories',
      tooltipKey: 'ADMIN.SIDEBAR.QCM_CATEGORIES'
    },
    {
      labelKey: 'ADMIN.SIDEBAR.DOCUMENTS',
      icon: 'fas fa-file-pdf',
      route: '/admin/documents',
      tooltipKey: 'ADMIN.SIDEBAR.DOCUMENTS'
    },
    {
      labelKey: 'ADMIN.SIDEBAR.CHATBOT_TRAINING',
      icon: 'fas fa-robot',
      route: '/admin/chatbot-training',
      badge: 'NEW',
      tooltipKey: 'ADMIN.SIDEBAR.CHATBOT_TRAINING'
    },
    {
      labelKey: 'ADMIN.SIDEBAR.STATISTICS',
      icon: 'fas fa-chart-bar',
      route: '/admin/statistics',
      tooltipKey: 'ADMIN.SIDEBAR.STATISTICS'
    }
  ];

  getNavLabel(item: NavItem): string {
    return this.translate.instant(item.labelKey);
  }

  getNavTooltip(item: NavItem): string {
    return this.translate.instant(item.tooltipKey || item.labelKey);
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
    this.saveSidebarState();
    this.applyBodyClasses();
  }

  isAdmin(): boolean {
    const user = this.authService.currentUser();
    return user?.role === 'admin';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  get currentUser() {
    return this.authService.currentUser;
  }

  getUserRole(): string {
    const user = this.authService.currentUser();
    return user?.role ? user.role.toUpperCase() : 'ADMIN';
  }

  getRoleKey(): string {
    return `ADMIN.ROLES.${this.getUserRole()}`;
  }

  getUserInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return 'A';
    if (user.full_name) {
      const names = user.full_name.split(' ');
      return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user.username ? user.username[0].toUpperCase() : 'A';
  }
}

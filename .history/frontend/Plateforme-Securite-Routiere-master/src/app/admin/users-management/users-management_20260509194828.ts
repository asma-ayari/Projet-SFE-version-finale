import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService, UserItem, UsersStats } from '../../core/services/user';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-users-management',
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule],
  templateUrl: './users-management.html',
  styleUrl: './users-management.css',
})
export class UsersManagement implements OnInit {
  private userService = inject(UserService);
  private translate = inject(TranslateService);

  searchTerm = signal('');
  roleFilter = signal<string>('all');
  statusFilter = signal<string>('all');
  currentPage = signal(1);
  itemsPerPage = 10;
  totalPages = signal(1);
  totalUsers = signal(0);

  showAddModal = signal(false);
  showDeleteModal = signal(false);
  selectedUser = signal<UserItem | null>(null);
  isLoading = signal(false);

  // Add user form
  newUser = { username: '', email: '', password: '', full_name: '', role: 'apprenant' };

  users = signal<UserItem[]>([]);
  stats = signal<UsersStats>({ total: 0, apprenants: 0, formateurs: 0, admins: 0, actifs: 0, inactifs: 0 });
  error = signal('');
  success = signal('');

  ngOnInit() {
    this.loadUsers();
    this.loadStats();
  }

  loadUsers() {
    this.isLoading.set(true);
    const isActive = this.statusFilter() === 'actif' ? true : this.statusFilter() === 'inactif' ? false : undefined;
    this.userService.getUsers(
      this.currentPage(), this.itemsPerPage,
      this.searchTerm() || undefined,
      this.roleFilter() !== 'all' ? this.roleFilter() : undefined,
      isActive,
    ).subscribe({
      next: (res) => {
        this.users.set(res.users);
        this.totalPages.set(res.pages);
        this.totalUsers.set(res.total);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.detail || this.translate.instant('COMMON.ERROR'));
        this.isLoading.set(false);
      }
    });
  }

  loadStats() {
    this.userService.getStats().subscribe({
      next: (s) => this.stats.set(s),
      error: () => { }
    });
  }

  onSearch() { this.currentPage.set(1); this.loadUsers(); }
  onFilterChange() { this.currentPage.set(1); this.loadUsers(); }

  createUser() {
    this.userService.createUser(this.newUser).subscribe({
      next: () => {
        this.showAddModal.set(false);
        this.newUser = { username: '', email: '', password: '', full_name: '', role: 'apprenant' };
        this.success.set(this.translate.instant('ADMIN.USERS.USER_CREATED'));
        this.loadUsers();
        this.loadStats();
        setTimeout(() => this.success.set(''), 3000);
      },
      error: (err) => this.error.set(err.error?.detail || this.translate.instant('COMMON.ERROR'))
    });
  }

  changeRole(user: UserItem, newRole: string) {
    this.userService.updateRole(user.id, newRole).subscribe({
      next: () => { this.loadUsers(); this.loadStats(); },
      error: (err) => this.error.set(err.error?.detail || this.translate.instant('COMMON.ERROR'))
    });
  }

  toggleStatus(user: UserItem) {
    this.userService.updateStatus(user.id, !user.is_active).subscribe({
      next: () => { this.loadUsers(); this.loadStats(); },
      error: (err) => this.error.set(err.error?.detail || this.translate.instant('COMMON.ERROR'))
    });
  }

  openDeleteModal(user: UserItem) {
    this.selectedUser.set(user);
    this.showDeleteModal.set(true);
  }

  deleteUser() {
    const user = this.selectedUser();
    if (!user) return;
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.showDeleteModal.set(false);
        this.selectedUser.set(null);
        this.success.set(this.translate.instant('ADMIN.USERS.USER_DELETED'));
        this.loadUsers();
        this.loadStats();
        setTimeout(() => this.success.set(''), 3000);
      },
      error: (err) => this.error.set(err.error?.detail || this.translate.instant('COMMON.ERROR'))
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadUsers();
    }
  }

  getAvatar(user: UserItem): string {
    return (user.full_name || user.username).charAt(0).toUpperCase();
  }

  getRoleBadgeClass(role: string): string {
    switch (role) { case 'admin': return 'badge-admin'; case 'formateur': return 'badge-formateur'; default: return 'badge-apprenant'; }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'admin':
        return this.translate.instant('ADMIN.USERS.ROLE_ADMIN');
      case 'formateur':
        return this.translate.instant('ADMIN.USERS.ROLE_TRAINER');
      default:
        return this.translate.instant('ADMIN.USERS.ROLE_LEARNER');
    }
  }
}

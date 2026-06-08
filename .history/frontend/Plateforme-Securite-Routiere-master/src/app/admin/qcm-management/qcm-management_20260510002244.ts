import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { QcmService, QCMListItem, QCMCategory } from '../../core/services/qcm';

@Component({
  selector: 'app-qcm-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  templateUrl: './qcm-management.html',
  styleUrl: './qcm-management.css',
})
export class QcmManagement implements OnInit {
  qcms: QCMListItem[] = [];
  categories: QCMCategory[] = [];
  total = 0;
  page = 1;
  pages = 1;
  limit = 10;
  filterCategory = '';
  filterPublished: string = '';
  loading = false;
  error = '';
  success = '';

  constructor(private qcmService: QcmService, private cdr: ChangeDetectorRef, private translate: TranslateService) { }

  ngOnInit() {
    this.loadCategories();
    this.loadQcms();
  }

  loadCategories() {
    this.qcmService.listCategories().subscribe({
      next: (rows) => {
        this.categories = rows;
        this.cdr.markForCheck();
      },
      error: () => { }
    });
  }

  loadQcms() {
    this.loading = true;
    this.error = '';
    const pub = this.filterPublished === '' ? undefined : this.filterPublished === 'true';
    this.qcmService.adminListQcms(this.page, this.limit, this.filterCategory || undefined, pub).subscribe({
      next: (res) => {
        this.qcms = res.qcms;
        this.total = res.total;
        this.pages = res.pages;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err.error?.detail || 'Erreur de chargement des QCM';
        this.loading = false;
        this.qcms = [];
        this.cdr.markForCheck();
      }
    });
  }

  onFilter() {
    this.page = 1;
    this.loadQcms();
  }

  goPage(p: number) {
    this.page = p;
    this.loadQcms();
  }

  togglePublish(qcm: QCMListItem) {
    this.qcmService.togglePublish(qcm.id).subscribe({
      next: (res) => {
        qcm.is_published = res.is_published;
        this.success = `QCM "${qcm.title}" ${res.is_published ? 'publié' : 'dépublié'}`;
        this.cdr.markForCheck();
        setTimeout(() => this.success = '', 3000);
      },
      error: () => {
        this.error = 'Erreur lors de la publication';
        this.cdr.markForCheck();
      }
    });
  }

  deleteQcm(qcm: QCMListItem) {
    if (!confirm(`Supprimer le QCM "${qcm.title}" ?`)) return;
    this.qcmService.deleteQcm(qcm.id).subscribe({
      next: () => {
        this.success = 'QCM supprimé';
        this.loadQcms();
        setTimeout(() => this.success = '', 3000);
      },
      error: () => {
        this.error = 'Erreur lors de la suppression';
        this.cdr.markForCheck();
      }
    });
  }

  getDifficultyBadge(d: string): string {
    switch (d) {
      case 'facile': return 'badge bg-success';
      case 'moyen': return 'badge bg-warning text-dark';
      case 'difficile': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }
}

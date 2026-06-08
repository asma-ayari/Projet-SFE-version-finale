import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { QcmService, QCMCategory } from '../../core/services/qcm';

@Component({
    selector: 'app-qcm-categories',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
    templateUrl: './qcm-categories.html',
    styleUrl: './qcm-categories.css',
})
export class QcmCategories implements OnInit {
    categories: QCMCategory[] = [];
    loading = false;
    creating = false;
    error = '';
    success = '';

    newCategoryName = '';
    editingId: number | null = null;
    editingName = '';

    constructor(private qcmService: QcmService, private cdr: ChangeDetectorRef, private translate: TranslateService) { }

    ngOnInit() {
        this.loadCategories();
    }

    loadCategories() {
        this.loading = true;
        this.error = '';
        this.qcmService.listCategories().subscribe({
            next: (rows) => {
                this.categories = rows;
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.error = this.translate.instant('QCM_CATEGORIES.LOADING_ERROR');
                this.loading = false;
                this.cdr.markForCheck();
            }
        });
    }

    createCategory() {
        const name = this.newCategoryName.trim();
        if (!name) {
            this.error = this.translate.instant('QCM_CATEGORIES.NAME_REQUIRED');
            return;
        }

        this.creating = true;
        this.error = '';

        this.qcmService.createCategory(name).subscribe({
            next: () => {
                this.newCategoryName = '';
                this.creating = false;
                this.success = this.translate.instant('QCM_CATEGORIES.CATEGORY_ADDED');
                this.loadCategories();
                setTimeout(() => this.success = '', 3000);
            },
            error: (err) => {
                this.error = this.translate.instant('QCM_CATEGORIES.CREATE_ERROR');
                this.creating = false;
                this.cdr.markForCheck();
            }
        });
    }

    startEdit(cat: QCMCategory) {
        this.editingId = cat.id;
        this.editingName = cat.name;
    }

    cancelEdit() {
        this.editingId = null;
        this.editingName = '';
    }

    saveEdit(cat: QCMCategory) {
        const name = this.editingName.trim();
        if (!name) {
            this.error = this.translate.instant('QCM_CATEGORIES.NAME_REQUIRED');
            return;
        }

        this.error = '';
        this.qcmService.updateCategory(cat.id, { name, is_active: cat.is_active }).subscribe({
            next: (updated) => {
                this.categories = this.categories.map(c => c.id === cat.id ? updated : c);
                this.cancelEdit();
                this.success = this.translate.instant('QCM_CATEGORIES.CATEGORY_MODIFIED');
                this.cdr.markForCheck();
                setTimeout(() => this.success = '', 3000);
            },
            error: (err) => {
                this.error = this.translate.instant('QCM_CATEGORIES.UPDATE_ERROR');
                this.cdr.markForCheck();
            }
        });
    }

    toggleActive(cat: QCMCategory) {
        this.error = '';
        this.qcmService.updateCategory(cat.id, { name: cat.name, is_active: !cat.is_active }).subscribe({
            next: (updated) => {
                this.categories = this.categories.map(c => c.id === cat.id ? updated : c);
                const msgKey = updated.is_active ? 'QCM_CATEGORIES.CATEGORY_ACTIVATED' : 'QCM_CATEGORIES.CATEGORY_DEACTIVATED';
                this.success = this.translate.instant(msgKey);
                this.cdr.markForCheck();
                setTimeout(() => this.success = '', 3000);
            },
            error: (err) => {
                this.error = this.translate.instant('QCM_CATEGORIES.UPDATE_ERROR');
                this.cdr.markForCheck();
            }
        });
    }

    deleteCategory(cat: QCMCategory) {
        if (!confirm(`${this.translate.instant('QCM_CATEGORIES.CONFIRM_DELETE_MSG')} "${cat.name}" ?`)) return;

        this.error = '';
        this.qcmService.deleteCategory(cat.id).subscribe({
            next: () => {
                this.categories = this.categories.filter(c => c.id !== cat.id);
                this.success = this.translate.instant('QCM_CATEGORIES.CATEGORY_DELETED');
                this.cdr.markForCheck();
                setTimeout(() => this.success = '', 3000);
            },
            error: (err) => {
                this.error = this.translate.instant('QCM_CATEGORIES.DELETE_ERROR');
                this.cdr.markForCheck();
            }
        });
    }
}

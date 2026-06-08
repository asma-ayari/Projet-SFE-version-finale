import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { QcmService, QCMGenerateRequest, QCMCategory } from '../../core/services/qcm';
import { timeout, finalize } from 'rxjs';

@Component({
    selector: 'app-qcm-generate',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './qcm-generate.html',
    styleUrl: './qcm-generate.css',
})
export class QcmGenerate {
    mode: 'general' | 'specific' = 'general';
    questionCount = 10;
    timePerQuestion: number | null = 30;
    difficulty: 'facile' | 'moyen' | 'difficile' = 'moyen';
    language: 'fr' | 'ar' = 'fr';

    private frThemes: string[] = [
        'Regles generales de circulation',
        'Priorites et intersections',
        'Signalisation et panneaux',
        'Vitesses et distances',
        'Alcool et infractions',
        'Permis et categories',
        'Accidents et secours',
        'Stationnement',
        'Depassement',
        'Eclairage et visibilite',
        'Assurance',
    ];
    private arThemes: string[] = [
        'القواعد العامة للسير',
        'الأولوية والتقاطعات',
        'الإشارات واللافتات',
        'السرعات والمسافات',
        'الكحول والمخالفات',
        'رخص السياقة والفئات',
        'الحوادث والإسعاف',
        'التوقف والوقوف',
        'التجاوز',
        'الإنارة والرؤية',
        'التأمين',
    ];
    selectedThemes: string[] = [];
    categories: QCMCategory[] = [];
    loading = false;
    error = '';

    constructor(
        private qcmService: QcmService,
        private router: Router,
        private zone: NgZone,
        private cdr: ChangeDetectorRef,
    ) {
        this.loadCategories();
    }

    loadCategories() {
        this.qcmService.listCategories().subscribe({
            next: (rows) => {
                this.zone.run(() => {
                    this.categories = rows.filter(c => c.is_active);
                    this.cdr.detectChanges();
                });
            },
            error: () => { }
        });
    }

    setMode(value: 'general' | 'specific') {
        this.mode = value;
        if (value === 'general') {
            this.selectedThemes = [];
        }
    }

    setLanguage(value: 'fr' | 'ar') {
        if (this.language === value) return;
        this.language = value;
        this.selectedThemes = [];
    }

    get availableThemes(): string[] {
        return this.language === 'ar' ? this.arThemes : this.frThemes;
    }

    toggleTheme(theme: string) {
        if (this.selectedThemes.includes(theme)) {
            this.selectedThemes = this.selectedThemes.filter(t => t !== theme);
        } else {
            this.selectedThemes = [...this.selectedThemes, theme];
        }
    }

    isThemeSelected(theme: string): boolean {
        return this.selectedThemes.includes(theme);
    }

    setQuestionCount(count: number) {
        this.questionCount = count;
    }

    setTimePerQuestion(value: number | null) {
        this.timePerQuestion = value;
    }

    get computedDurationMinutes(): number {
        if (!this.timePerQuestion) {
            return 0;
        }
        const totalSeconds = this.timePerQuestion * this.questionCount;
        return Math.max(1, Math.ceil(totalSeconds / 60));
    }

    generate() {
        this.error = '';
        if (this.mode === 'specific' && this.selectedThemes.length === 0) {
            this.error = 'Veuillez choisir au moins un theme.';
            return;
        }

        const payload: QCMGenerateRequest = {
            mode: this.mode,
            themes: this.mode === 'specific' ? this.selectedThemes : undefined,
            question_count: this.questionCount,
            duration_minutes: this.computedDurationMinutes,
            language: this.language,
            difficulty: this.difficulty,
        };

        const requestTimeoutMs = 180000;
        this.loading = true;
        this.qcmService.generateQcm(payload).pipe(
            timeout(requestTimeoutMs),
            finalize(() => {
                this.zone.run(() => {
                    this.loading = false;
                    this.cdr.detectChanges();
                });
            })
        ).subscribe({
            next: (res) => {
                this.router.navigate(['/apprenant/qcm', res.qcm_id], { queryParams: { generated: '1' } });
            },
            error: (err) => {
                this.zone.run(() => {
                    if (err?.name === 'TimeoutError') {
                        this.error = 'La generation prend trop de temps. Reessayez dans quelques secondes.';
                    } else {
                        this.error = err.error?.detail || 'Erreur lors de la generation du QCM';
                    }
                    this.cdr.detectChanges();
                });
            }
        });
    }
}

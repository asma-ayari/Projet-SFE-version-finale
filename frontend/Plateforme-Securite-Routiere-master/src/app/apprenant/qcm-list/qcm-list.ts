import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { QcmService, QCMListItem } from '../../core/services/qcm';
import { LanguageService } from '../../core/services/language.service';
import { filter, finalize, Subscription, timeout } from 'rxjs';
import { ChatbotWidgetComponent } from '../../shared/chatbot-widget/chatbot-widget';

@Component({
  selector: 'app-qcm-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ChatbotWidgetComponent, TranslateModule],
  templateUrl: './qcm-list.html',
  styleUrl: './qcm-list.css',
})
export class QcmList implements OnInit, OnDestroy {
  qcms: QCMListItem[] = [];
  officialQcms: QCMListItem[] = [];
  generatedQcms: QCMListItem[] = [];
  selectedCategory = '';
  loading = false;
  error = '';
  generatedPage = 0;
  readonly generatedPageSize = 3;
  private langSub?: Subscription;
  private navSub?: Subscription;

  constructor(
    private qcmService: QcmService,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
    private languageService: LanguageService,
    private router: Router,
  ) { }

  // ✅ CORRECTION : defaultText accepte string | undefined
  getTranslation(key: string, defaultText: string | undefined): string {
    if (!key) return defaultText ?? '';
    const val = this.translateService.instant(key);
    return val !== key ? val : (defaultText ?? '');
  }

  ngOnInit() {
    this.load();
    this.langSub = this.translateService.onLangChange.subscribe(() => this.load());
    // Recharger la liste à chaque fois que l'utilisateur revient sur cette page
    this.navSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd && e.urlAfterRedirects.includes('/apprenant/qcm') && !e.urlAfterRedirects.includes('/apprenant/qcm/'))
    ).subscribe(() => {
      this.load();
    });
  }

  ngOnDestroy() {
    this.langSub?.unsubscribe();
    this.navSub?.unsubscribe();
  }

  load() {
    this.loading = true;
    this.error = '';
    const lang = this.languageService.getCurrentLang();
    this.qcmService
      .listPublished(this.selectedCategory || undefined, lang)
      .pipe(
        timeout(8000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          if (!Array.isArray(data)) {
            this.error = 'Réponse invalide du serveur.';
            this.qcms = [];
            this.officialQcms = [];
            this.generatedQcms = [];
            this.generatedPage = 0;
            return;
          }

          const sorted = [...data].sort((a, b) => {
            const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
            const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
            return bTime - aTime;
          });

          this.qcms = sorted;
          this.officialQcms = sorted.filter((q) => !q.is_generated);
          this.generatedQcms = sorted.filter((q) => q.is_generated);
          this.generatedPage = 0;
          this.cdr.detectChanges();
        },
        error: (err) => {
          if (err?.name === 'TimeoutError') {
            this.error = 'Temps de réponse dépassé. Vérifiez le serveur.';
          } else {
            this.error = err.error?.detail || err.message || 'Erreur de chargement';
          }
          this.qcms = [];
          this.officialQcms = [];
          this.generatedQcms = [];
          this.generatedPage = 0;
          this.cdr.detectChanges();
        }
      });
  }

  onCategoryChange() {
    this.load();
  }

  get visibleGeneratedQcms(): QCMListItem[] {
    const start = this.generatedPage * this.generatedPageSize;
    return this.generatedQcms.slice(start, start + this.generatedPageSize);
  }

  get generatedTotalPages(): number {
    return Math.max(1, Math.ceil(this.generatedQcms.length / this.generatedPageSize));
  }

  get canPrevGenerated(): boolean {
    return this.generatedPage > 0;
  }

  get canNextGenerated(): boolean {
    return this.generatedPage + 1 < this.generatedTotalPages;
  }

  prevGenerated(): void {
    if (this.canPrevGenerated) {
      this.generatedPage -= 1;
    }
  }

  nextGenerated(): void {
    if (this.canNextGenerated) {
      this.generatedPage += 1;
    }
  }

  getDifficultyClass(d: string): string {
    switch (d) {
      case 'facile': return 'text-bg-success';
      case 'moyen': return 'text-bg-warning';
      case 'difficile': return 'text-bg-danger';
      default: return 'text-bg-secondary';
    }
  }

  getDifficultyLabel(difficulty: string): string {
    switch ((difficulty || '').toLowerCase()) {
      case 'facile': return 'QCM_PANEL.LIST.LEVEL_EASY';
      case 'moyen': return 'QCM_PANEL.LIST.LEVEL_MEDIUM';
      case 'difficile': return 'QCM_PANEL.LIST.LEVEL_HARD';
      default: return difficulty;
    }
  }

  getCategoryLabel(category: string): string {
    switch (category) {
      case 'code_route': return 'QCM_PANEL.LIST.CAT_CODE';
      case 'signalisation': return 'QCM_PANEL.LIST.CAT_SIGNALISATION';
      case 'securite': return 'QCM_PANEL.LIST.CAT_SECURITE';
      case 'conduite': return 'QCM_PANEL.LIST.CAT_CONDUITE';
      case 'general': return 'QCM_PANEL.LIST.CAT_GENERAL';
      case 'physique': return 'QCM_PANEL.LIST.CAT_PHYSIQUE';
      default: return category;
    }
  }
}
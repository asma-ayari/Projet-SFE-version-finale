import { Component, OnDestroy, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { QcmService, QCMResult, QCMDetail } from '../../core/services/qcm';
import { LanguageService } from '../../core/services/language.service';
import { environment } from '../../../environments/environment';
import { of, catchError, finalize, Subscription, tap } from 'rxjs';

@Component({
  selector: 'app-qcm-resultat',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './qcm-resultat.html',
  styleUrl: './qcm-resultat.css',
})
export class QcmResultat implements OnInit, OnDestroy {
  result: QCMResult | null = null;
  allResults: QCMResult[] = [];
  loading = true;
  private qcmIdFromRoute: number | null = null;
  private qcmDetail: QCMDetail | null = null;
  private isGeneratedQcm = false;
  private generatedTitleById = new Map<number, string>();
  private langSub?: Subscription;
  backendUrl = environment.apiUrl;

  normalizedDetails: Array<{
    question_text: string;
    question_image?: string;
    selected_answer: string;
    correct_answer: string;
    explanation: string;
    is_correct: boolean;
  }> = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private qcmService: QcmService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
    private languageService: LanguageService,
  ) { }

  getTranslation(key: string, defaultText: string): string {
    if (!key) return defaultText;
    const val = this.translateService.instant(key);
    return val !== key ? val : defaultText;
  }

  getQcmTitle(qcmId: number | undefined, defaultTitle: string): string {
    if (!qcmId) return defaultTitle;
    if (this.generatedTitleById.has(qcmId)) {
      return this.generatedTitleById.get(qcmId)!;
    }
    if (this.isGeneratedQcm && this.qcmDetail?.id === qcmId) {
      return this.qcmDetail.title;
    }
    return this.getTranslation(`QCM_${qcmId}.TITLE`, defaultTitle);
  }

  ngOnInit() {
    this.loadGeneratedTitles();
    this.langSub = this.translateService.onLangChange.subscribe(() => {
      this.loadGeneratedTitles();
      if (this.result) {
        this.loadQcmDetailAndNormalize();
      }
    });
    const routeId = Number(this.route.snapshot.paramMap.get('id'));
    this.qcmIdFromRoute = Number.isFinite(routeId) ? routeId : null;

    // ✅ Résultat depuis navigation state
    const nav = history.state?.result;
    if (nav && (!this.qcmIdFromRoute || nav.qcm_id === this.qcmIdFromRoute)) {
      this.result = nav;
      sessionStorage.setItem('lastQcmResult', JSON.stringify(nav));
    } else {
      // ✅ Restaurer depuis sessionStorage si refresh
      const saved = sessionStorage.getItem('lastQcmResult');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (!this.qcmIdFromRoute || parsed.qcm_id === this.qcmIdFromRoute) {
            this.result = parsed;
          }
        } catch { }
      }
    }

    // ✅ Charger historique + détail en parallèle
    this.qcmService.getMyResults().subscribe({
      next: (results) => {
        // Ensure UI updates reliably after async work
        this.zone.run(() => {
          this.allResults = results;

          // Si pas encore de résultat, prendre depuis l'historique
          if (!this.result) {
            const matched = this.qcmIdFromRoute
              ? results.find(item => item.qcm_id === this.qcmIdFromRoute)
              : results[0];
            if (matched) {
              this.result = matched;
            }
          }

          // ✅ Charger le détail QCM maintenant qu'on a le résultat
          if (this.result) {
            this.loadQcmDetailAndNormalize();
          } else {
            // Aucun résultat trouvé — arrêter le loading
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.zone.run(() => {
          // ✅ Même en cas d'erreur historique, afficher ce qu'on a
          if (this.result) {
            this.loadQcmDetailAndNormalize();
          } else {
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.langSub?.unsubscribe();
  }

  private loadGeneratedTitles() {
    const lang = this.languageService.getCurrentLang();
    this.qcmService.listPublished(undefined, lang).subscribe({
      next: (items) => {
        this.generatedTitleById.clear();
        items.filter((item) => item.is_generated).forEach((item) => {
          this.generatedTitleById.set(item.id, item.title);
        });
        this.cdr.detectChanges();
      },
    });
  }

  private loadQcmDetailAndNormalize() {
    if (!this.result) {
      this.loading = false;
      return;
    }

    const qcmId = this.result.qcm_id;
    const lang = this.languageService.getCurrentLang();

    this.qcmService.getQcmForTest(qcmId).pipe(
      tap(() => {
        this.isGeneratedQcm = false;
      }),
      catchError(() => {
        this.isGeneratedQcm = true;
        return this.qcmService.getGeneratedQcmForTest(qcmId, lang);
      }),
      tap((qcm) => {
        this.qcmDetail = qcm;
      }),
      catchError(() => {
        this.qcmDetail = null;
        return of(null);
      }),
      finalize(() => {
        this.zone.run(() => {
          try {
            this.normalizeDetails();
          } finally {
            this.loading = false;
            this.cdr.detectChanges();
          }
        });
      })
    ).subscribe();
  }

  private normalizeDetails() {
    this.normalizedDetails = [];
    if (!this.result?.details) return;

    const noAnswerText = this.translateService.instant('QCM_PANEL.RESULT.NO_ANSWER') || 'Pas de réponse';
    const unknownText = this.translateService.instant('QCM_PANEL.RESULT.UNKNOWN') || 'Inconnu';

    for (const d of this.result.details) {
      const nd: any = {
        is_correct: d.is_correct ?? false,
        question_text: '',
        question_image: undefined,
        selected_answer: '',
        correct_answer: '',
        explanation: '',
      };

      if (this.qcmDetail?.questions) {
        const question = this.qcmDetail.questions.find(
          q => q.id === d.question_id
        );

        if (question) {
          const qcmId = this.qcmDetail.id;
          const qIndex = this.qcmDetail.questions.findIndex(q => q.id === question.id);
          const questionKey = `QCM_${qcmId}.QUESTION_${qIndex + 1}`;

          if (this.isGeneratedQcm) {
            nd.question_text = question.text || '';
            nd.explanation = question.explanation || '';
          } else {
            nd.question_text = this.getTranslation(`${questionKey}.TEXT`, question.text || '');
            nd.explanation = this.getTranslation(`${questionKey}.EXPLANATION`, question.explanation || '');
          }
          nd.question_image = question.image_url || undefined;

          const selectedAnswer = question.answers.find(
            a => a.id === d.answer_id
          );
          const saIndex = selectedAnswer ? question.answers.findIndex(a => a.id === selectedAnswer.id) : -1;
          const saKey = saIndex !== -1 ? `${questionKey}.ANSWER_${['A','B','C','D','E','F'][saIndex]}` : '';
          nd.selected_answer = selectedAnswer
            ? (this.isGeneratedQcm ? selectedAnswer.text : this.getTranslation(saKey, selectedAnswer.text))
            : noAnswerText;

          const correctAnswer = question.answers.find(
            a => a.id === d.correct_answer_id
          ) || question.answers.find(a => a.is_correct);
          const caIndex = correctAnswer ? question.answers.findIndex(a => a.id === correctAnswer.id) : -1;
          const caKey = caIndex !== -1 ? `${questionKey}.ANSWER_${['A','B','C','D','E','F'][caIndex]}` : '';
          nd.correct_answer = correctAnswer
            ? (this.isGeneratedQcm ? correctAnswer.text : this.getTranslation(caKey, correctAnswer.text))
            : unknownText;
        }
      }

      // ✅ Fallback si pas de détail QCM
      if (!nd.question_text) {
        nd.question_text = d.question_text || d.question || `Question ${d.question_id}`;
        nd.selected_answer = d.selected_answer_text || d.selected_answer || noAnswerText;
        nd.correct_answer = d.correct_answer_text || d.correct_answer || unknownText;
        nd.explanation = d.explanation || '';
      }

      this.normalizedDetails.push(nd);
    }
  }

  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${this.backendUrl}${imageUrl}`;
  }

  isQuizPassed(result: { score: number; passed?: boolean } | null): boolean {
    if (!result) return false;
    return result.score >= 50;
  }

  get scoreClass(): string {
    if (!this.result) return '';
    return this.isQuizPassed(this.result) ? 'text-success' : 'text-danger';
  }

  get scoreIcon(): string {
    if (!this.result) return '';
    return this.isQuizPassed(this.result) ? 'bi-check-circle-fill' : 'bi-x-circle-fill';
  }

  formatDuration(seconds?: number): string {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }
}
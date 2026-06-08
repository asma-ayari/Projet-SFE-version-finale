import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { QcmService, QCMResult, QCMDetail } from '../../core/services/qcm';
import { environment } from '../../../environments/environment';
import { of, catchError, finalize, tap } from 'rxjs';

@Component({
  selector: 'app-qcm-resultat',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './qcm-resultat.html',
  styleUrl: './qcm-resultat.css',
})
export class QcmResultat implements OnInit {
  result: QCMResult | null = null;
  allResults: QCMResult[] = [];
  loading = true;
  private qcmIdFromRoute: number | null = null;
  private qcmDetail: QCMDetail | null = null;
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
  ) { }

  ngOnInit() {
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

  private loadQcmDetailAndNormalize() {
    if (!this.result) {
      this.loading = false;
      return;
    }

    const qcmId = this.result.qcm_id;

    // Always stop spinner even if QCM is not published.
    // Try published endpoint first, then fallback to generated.
    this.qcmService.getQcmForTest(qcmId).pipe(
      catchError(() => this.qcmService.getGeneratedQcmForTest(qcmId)),
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
          nd.question_text = question.text || '';
          nd.question_image = question.image_url || undefined;
          nd.explanation = question.explanation || '';

          const selectedAnswer = question.answers.find(
            a => a.id === d.answer_id
          );
          nd.selected_answer = selectedAnswer?.text || 'Pas de réponse';

          const correctAnswer = question.answers.find(
            a => a.id === d.correct_answer_id
          ) || question.answers.find(a => a.is_correct);
          nd.correct_answer = correctAnswer?.text || 'Inconnu';
        }
      }

      // ✅ Fallback si pas de détail QCM
      if (!nd.question_text) {
        nd.question_text = d.question_text || d.question || `Question ${d.question_id}`;
        nd.selected_answer = d.selected_answer_text || d.selected_answer || 'Pas de réponse';
        nd.correct_answer = d.correct_answer_text || d.correct_answer || 'Inconnu';
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

  get scoreClass(): string {
    if (!this.result) return '';
    return this.result.passed ? 'text-success' : 'text-danger';
  }

  get scoreIcon(): string {
    if (!this.result) return '';
    return this.result.passed ? 'bi-check-circle-fill' : 'bi-x-circle-fill';
  }

  formatDuration(seconds?: number): string {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }

  selectResult(r: QCMResult) {
    this.result = r;
    this.qcmIdFromRoute = r.qcm_id;
    this.qcmDetail = null;
    this.normalizedDetails = [];
    this.loading = true;
    sessionStorage.setItem('lastQcmResult', JSON.stringify(r));
    this.loadQcmDetailAndNormalize();
  }
}
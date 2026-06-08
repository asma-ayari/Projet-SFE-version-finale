import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { QcmService, QCMResult, QCMDetail } from '../../core/services/qcm';
import { environment } from '../../../environments/environment';

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
  ) { }

  ngOnInit() {
    const routeId = Number(this.route.snapshot.paramMap.get('id'));
    this.qcmIdFromRoute = Number.isFinite(routeId) ? routeId : null;

    // ✅ Résultat depuis navigation state
    const nav = history.state?.result;
    if (nav && (!this.qcmIdFromRoute || nav.qcm_id === this.qcmIdFromRoute)) {
      this.result = nav;
      // ✅ Sauvegarder dans sessionStorage pour survivre au refresh
      sessionStorage.setItem('lastQcmResult', JSON.stringify(nav));
      this.loadQcmDetailAndNormalize();
    } else {
      // ✅ Essayer de récupérer depuis sessionStorage si refresh
      const saved = sessionStorage.getItem('lastQcmResult');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (!this.qcmIdFromRoute || parsed.qcm_id === this.qcmIdFromRoute) {
            this.result = parsed;
            this.loadQcmDetailAndNormalize();
          }
        } catch { }
      }
    }

    // ✅ Charger l'historique
    this.qcmService.getMyResults().subscribe({
      next: (results) => {
        this.allResults = results;
        if (!this.result) {
          const matched = this.qcmIdFromRoute
            ? results.find(item => item.qcm_id === this.qcmIdFromRoute)
            : results[0];
          if (matched) {
            this.result = matched;
            this.loadQcmDetailAndNormalize();
          }
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  private loadQcmDetailAndNormalize() {
    if (!this.result) return;
    const qcmId = this.result.qcm_id;

    this.qcmService.getQcmForTest(qcmId).subscribe({
      next: (qcm) => {
        this.qcmDetail = qcm;
        this.normalizeDetails();
        this.loading = false;
      },
      error: () => {
        this.qcmService.getGeneratedQcmForTest(qcmId).subscribe({
          next: (qcm) => {
            this.qcmDetail = qcm;
            this.normalizeDetails();
            this.loading = false;
          },
          error: () => {
            this.normalizeDetails();
            this.loading = false;
          }
        });
      }
    });
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

      if (!nd.question_text) {
        nd.question_text = d.question_text || d.question || `Question ${d.question_id}`;
        nd.selected_answer = d.selected_answer || 'Pas de réponse';
        nd.correct_answer = d.correct_answer || 'Inconnu';
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
    sessionStorage.setItem('lastQcmResult', JSON.stringify(r));
    this.loadQcmDetailAndNormalize();
  }
}
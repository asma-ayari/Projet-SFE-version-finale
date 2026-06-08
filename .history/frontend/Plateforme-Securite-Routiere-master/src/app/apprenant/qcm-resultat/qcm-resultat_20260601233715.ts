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

  // ✅ QCM complet pour récupérer les textes des réponses
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

    // Résultat depuis navigation state (soumission directe)
    const nav = this.router.getCurrentNavigation?.()?.extras?.state?.['result']
      || history.state?.result;
    if (nav && (!this.qcmIdFromRoute || nav.qcm_id === this.qcmIdFromRoute)) {
      this.result = nav;
      this.loading = false;
      this.loadQcmDetailAndNormalize();
    }

    // Historique complet
    this.qcmService.getMyResults().subscribe({
      next: (results) => {
        this.allResults = results;
        if (!this.result) {
          const matched = this.qcmIdFromRoute
            ? results.find((item) => item.qcm_id === this.qcmIdFromRoute)
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

  // ✅ Charger le QCM complet pour avoir les textes des réponses
  private loadQcmDetailAndNormalize() {
    if (!this.result) return;

    const qcmId = this.result.qcm_id;
    const isGenerated = this.allResults.find(r => r.qcm_id === qcmId);

    // Essayer d'abord le QCM publié, sinon le QCM généré
    this.qcmService.getQcmForTest(qcmId).subscribe({
      next: (qcm) => {
        this.qcmDetail = qcm;
        this.normalizeDetails();
      },
      error: () => {
        // Si pas trouvé en publié, essayer le QCM généré
        this.qcmService.getGeneratedQcmForTest(qcmId).subscribe({
          next: (qcm) => {
            this.qcmDetail = qcm;
            this.normalizeDetails();
          },
          error: () => {
            // Fallback sans détails textuels
            this.normalizeDetails();
          }
        });
      }
    });
  }

  // ✅ Normaliser les détails avec les vrais textes
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

      // Chercher la question dans le QCM complet
      if (this.qcmDetail?.questions) {
        const question = this.qcmDetail.questions.find(
          q => q.id === d.question_id
        );

        if (question) {
          nd.question_text = question.text || '';
          nd.question_image = question.image_url || undefined;
          nd.explanation = question.explanation || '';

          // Texte de la réponse choisie par l'apprenant
          if (d.answer_id) {
            const selectedAnswer = question.answers.find(
              a => a.id === d.answer_id
            );
            nd.selected_answer = selectedAnswer?.text || 'Pas de réponse';
          } else {
            nd.selected_answer = 'Pas de réponse';
          }

          // Texte de la bonne réponse
          if (d.correct_answer_id) {
            const correctAnswer = question.answers.find(
              a => a.id === d.correct_answer_id
            );
            nd.correct_answer = correctAnswer?.text || 'Inconnu';
          } else {
            const correctAnswer = question.answers.find(a => a.is_correct);
            nd.correct_answer = correctAnswer?.text || 'Inconnu';
          }
        }
      }

      // Fallback si pas de QCM detail
      if (!nd.question_text) {
        nd.question_text = d.question_text || d.question || `Question ${d.question_id}`;
        nd.selected_answer = d.selected_answer || d.selected_answer_text || 'Pas de réponse';
        nd.correct_answer = d.correct_answer || d.correct_answer_text || 'Inconnu';
        nd.explanation = d.explanation || '';
      }

      this.normalizedDetails.push(nd);
    }
  }

  // ✅ URL complète image
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
    this.loadQcmDetailAndNormalize();
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { QcmService, QCMResult } from '../../core/services/qcm';

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
  // Fallback placeholder when question has no image
  placeholderUrl = 'https://via.placeholder.com/800x250?text=Image+manquante';
  private qcmIdFromRoute: number | null = null;
  // Normalized details for robust display (handles multiple backend shapes)
  normalizedDetails: Array<{
    question?: string;
    selected_answer?: string;
    correct_answer?: string;
    explanation?: string;
    is_correct?: boolean;
    image_url?: string;
  }> = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private qcmService: QcmService,
  ) { }

  ngOnInit() {
    const routeId = Number(this.route.snapshot.paramMap.get('id'));
    this.qcmIdFromRoute = Number.isFinite(routeId) ? routeId : null;

    // Attempt to get result from router state (just submitted)
    const nav = this.router.getCurrentNavigation?.()?.extras?.state?.['result']
      || history.state?.result;
    if (nav && (!this.qcmIdFromRoute || nav.qcm_id === this.qcmIdFromRoute)) {
      this.result = nav;
      this.loading = false;
      this.normalizeDetails();
    }

    // Also load all results history
    this.qcmService.getMyResults().subscribe({
      next: (results) => {
        this.allResults = results;
        if (!this.result) {
          const matched = this.qcmIdFromRoute
            ? results.find((item) => item.qcm_id === this.qcmIdFromRoute)
            : results[0];
          if (matched) {
            this.result = matched;
          }
          this.normalizeDetails();
        }
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  private normalizeDetails() {
    this.normalizedDetails = [];
    if (!this.result || !this.result.details) return;
    for (const d of this.result.details) {
      const nd: any = {};
      nd.is_correct = d.is_correct ?? d.correct ?? false;
      nd.question = d.question_text || d.question || d.q || d.q_text || d.title || '';
      nd.selected_answer = d.selected_answer_text || d.selected_answer || d.user_answer_text || d.selected || d.chosen || '';
      nd.correct_answer = d.correct_answer_text || d.correct_answer || d.expected_answer_text || d.answer_correct || d.correct_choice || '';
      nd.explanation = d.explanation || d.explain || d.answer_explanation || '';
      nd.image_url = d.image_url || d.imageUrl || d.image || null;
      this.normalizedDetails.push(nd);
    }
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
    this.normalizeDetails();
  }
}

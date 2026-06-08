import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { QcmService, QCMResult } from '../../core/services/qcm';
import { timeout, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-qcm-resultat',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './qcm-resultat.html',
  styleUrl: './qcm-resultat.css',
})
export class QcmResultat implements OnInit {
  result: QCMResult | null = null;
  allResults: QCMResult[] = [];
  loading = true;

  constructor(private router: Router, private qcmService: QcmService) { }

  ngOnInit() {
    // Attempt to get result from router state (just submitted)
    const nav = this.router.getCurrentNavigation?.()?.extras?.state?.['result']
      || history.state?.result;
    if (nav) {
      this.result = nav;
      this.loading = false;
    }

    // Also load all results history
    this.qcmService.getMyResults()
      .pipe(
        timeout(10000), // Maximum 10 seconds wait
        finalize(() => this.loading = false) // ALWAYS set to false
      )
      .subscribe({
        next: (results) => {
          console.log('[QCM] Loaded', results.length, 'results');
          this.allResults = results;
          if (!this.result && results.length > 0) {
            this.result = results[0]; // show most recent
          }
        },
        error: (err) => {
          console.error('[QCM] Error loading results:', err?.message || err);
        }
      });
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
  }
}

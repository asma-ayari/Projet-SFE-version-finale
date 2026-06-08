import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { StatisticsService, AdminStats } from '../../core/services/statistics';
import { Subject } from 'rxjs';
import { takeUntil, finalize, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './statistics.html',
  styleUrl: './statistics.css',
})
export class Statistics implements OnInit, OnDestroy {
  stats: AdminStats | null = null;
  loading = true;
  error = '';
  private destroy$ = new Subject<void>();

  constructor(
    private statsService: StatisticsService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.loadStatistics();
  }

  private loadStatistics(): void {
    this.loading = true;
    this.error = '';
    this.cdr.markForCheck();

    this.statsService.getAdminStats()
      .pipe(
        timeout(10000),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data) => {
          this.stats = data;
        },
        error: (err) => {
          this.error = this.translate.instant('ADMIN.STATISTICS.LOAD_ERROR');
          console.error('Statistics loading error:', err);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

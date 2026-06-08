import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QcmService, QCMDetail } from '../../core/services/qcm';
import { StatisticsService } from '../../core/services/statistics';

@Component({
  selector: 'app-qcm-detail-formateur',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qcm-detail.html',
  styleUrl: './qcm-detail.css',
})
export class QcmDetailFormateur implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private qcmService = inject(QcmService);
  private statisticsService = inject(StatisticsService);

  // Signals
  qcm = signal<QCMDetail | null>(null);
  loading = signal(true);
  error = signal('');
  statistics = signal<any>(null);
  statsLoading = signal(true);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    if (!id) {
      this.error.set('ID du QCM invalide');
      this.loading.set(false);
      return;
    }

    this.loadQcmDetails(id);
    this.loadQcmStatistics(id);
  }

  ngOnDestroy() {
    // Cleanup
  }

  /**
   * Charge les détails du QCM
   */
  private loadQcmDetails(id: number): void {
    this.loading.set(true);
    console.log('📋 Chargement des détails du QCM:', id);

    this.qcmService.getQcmForTest(id).subscribe({
      next: (qcm) => {
        console.log('✅ QCM chargé:', qcm);
        this.qcm.set(qcm);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Erreur chargement QCM:', err);
        this.error.set(err.error?.detail || 'QCM non trouvé');
        this.loading.set(false);
      }
    });
  }

  /**
   * Charge les statistiques du QCM
   */
  private loadQcmStatistics(id: number): void {
    this.statsLoading.set(true);
    console.log('📊 Chargement des statistiques du QCM:', id);

    // Utiliser l'endpoint de statistiques si disponible
    // Sinon on peut récupérer les données depuis qcm.results_count
    this.statsLoading.set(false);
  }

  /**
   * Retourne le nombre de questions
   */
  getQuestionsCount(): number {
    return this.qcm()?.questions?.length || 0;
  }

  /**
   * Retourne la durée en minutes
   */
  getDuration(): number {
    return this.qcm()?.duration_minutes || 0;
  }

  /**
   * Retourne le score de passage
   */
  getPassScore(): number {
    return this.qcm()?.pass_score || 0;
  }

  /**
   * Retourne le niveau de difficulté
   */
  getDifficulty(): string {
    return this.qcm()?.difficulty || 'moyen';
  }

  /**
   * Retourne la classe CSS pour le badge de difficulté
   */
  getDifficultyClass(): string {
    const difficulty = this.getDifficulty().toLowerCase();
    return `difficulty-${difficulty}`;
  }

  /**
   * Retourne la classe de couleur pour le badge de difficulté
   */
  getDifficultyBadgeClass(): string {
    const difficulty = this.getDifficulty().toLowerCase();
    switch (difficulty) {
      case 'facile':
        return 'badge-success';
      case 'moyen':
        return 'badge-warning';
      case 'difficile':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  /**
   * Retour au dashboard
   */
  goBack(): void {
    this.router.navigate(['/formateur/dashboard']);
  }

  /**
   * Vérifier si tous les champs sont chargés
   */
  get allDataLoaded(): boolean {
    return !this.loading() && !this.statsLoading();
  }
}


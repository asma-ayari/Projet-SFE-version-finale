import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, Chart, registerables } from 'chart.js';
import { CoursService, CourseDetail } from '../../core/services/cours';

Chart.register(...registerables);

@Component({
  selector: 'app-cours-statistics',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './cours-statistics.html',
  styleUrl: './cours-statistics.css',
})
export class CoursStatistics implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private coursService = inject(CoursService);

  course = signal<CourseDetail | null>(null);
  loading = signal(true);
  error = signal('');

  // Statistiques générales
  enrollmentStats = {
    total: 156,
    active: 142,
    completed: 89,
    abandoned: 25
  };

  // Données des graphiques
  enrollmentChartData: ChartData<'line'> = {
    labels: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4', 'Semaine 5', 'Semaine 6', 'Semaine 7'],
    datasets: [{
      label: 'Inscriptions cumulées',
      data: [12, 28, 45, 78, 110, 135, 156],
      borderColor: '#1565c0',
      backgroundColor: 'rgba(21, 101, 192, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  enrollmentChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  };

  // Données de progression
  progressChartData: ChartData<'doughnut'> = {
    labels: ['Complétés', 'En cours', 'Non commencés'],
    datasets: [{
      data: [89, 53, 14],
      backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  progressChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } }
  };

  // Données de satisfaction
  satisfactionChartData: ChartData<'bar'> = {
    labels: ['5 étoiles', '4 étoiles', '3 étoiles', '2 étoiles', '1 étoile'],
    datasets: [{
      label: 'Nombre d\'évaluations',
      data: [65, 42, 18, 8, 3],
      backgroundColor: ['#4caf50', '#8bc34a', '#ff9800', '#ff5722', '#f44336']
    }]
  };

  satisfactionChartOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } }
  };

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('ID du cours manquant');
      this.loading.set(false);
      return;
    }

    // Essayer d'obtenir les données du state de navigation via window.history
    const stateData = (window.history.state as any)?.cours;
    console.log('📋 CoursStatistics - State data:', stateData, 'URL id:', id, 'Match:', stateData?.id === id);

    if (stateData && stateData.id === id) {
      console.log('✅ CoursStatistics - Utilisation des données du state');
      // Utiliser les données passées via la navigation
      const courseData: CourseDetail = {
        id: stateData.id,
        title: stateData.titre,
        description: stateData.categorie,
        category: stateData.categorie,
        level: stateData.status || 'Intermédiaire',
        duration: String(stateData.vues || 60),
        image_url: '',
        video_url: '',
        is_published: stateData.status === 'publie',
        order: stateData.id,
        content: `Cours: ${stateData.titre}`
      };
      this.course.set(courseData);
      this.loading.set(false);
    } else {
      console.log('⚠️ CoursStatistics - Pas de state data, chargement depuis le backend...');
      // Sinon, essayer de charger depuis le backend (fallback)
      this.coursService.manageGet(id).subscribe({
        next: (course) => {
          console.log('✅ CoursStatistics - Backend data loaded:', course);
          this.course.set(course);
          this.loading.set(false);
        },
        error: (err) => {
          console.warn('❌ CoursStatistics - Erreur chargement backend manage, tentative avec /published:', err);
          // Fallback sur published
          this.coursService.getPublished(id).subscribe({
            next: (course) => {
              console.log('✅ CoursStatistics - Published data loaded:', course);
              this.course.set(course);
              this.loading.set(false);
            },
            error: (err2) => {
              console.error('❌ CoursStatistics - Erreur chargement published:', err2);
              this.error.set(err2.error?.detail || 'Erreur lors du chargement du cours');
              this.loading.set(false);
            }
          });
        }
      });
    }
  }

  /**
   * Retourner au dashboard
   */
  goBack(): void {
    this.router.navigate(['/formateur/dashboard']);
  }

  /**
   * Revenir à la vue du cours
   */
  viewCourse(): void {
    const id = this.course()?.id;
    if (id) {
      this.router.navigate(['/formateur/cours', id, 'voir'], {
        state: { cours: this.course() }
      });
    }
  }

  /**
   * Modifier le cours
   */
  editCourse(): void {
    const id = this.course()?.id;
    if (id) {
      this.router.navigate(['/formateur/cours', id, 'modifier'], {
        state: { cours: this.course() }
      });
    }
  }
}

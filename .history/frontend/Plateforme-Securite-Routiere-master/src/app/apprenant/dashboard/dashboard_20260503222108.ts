import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartConfiguration, Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, LineController, RadarController, RadialLinearScale, Filler, Legend, Tooltip } from 'chart.js';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { StatisticsService } from '../../core/services/statistics';
import { CoursesService } from '../../core/services/courses.service';
import { VideoService } from '../../core/services/video.service';
import { ChatbotWidgetComponent } from '../../shared/chatbot-widget/chatbot-widget';

// Register all Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  RadarController,
  RadialLinearScale,
  Filler,
  Legend,
  Tooltip
);

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, BaseChartDirective, ChatbotWidgetComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private statisticsService = inject(StatisticsService);
  private coursesService = inject(CoursesService);
  private videoService = inject(VideoService);
  
  // Nombre de cours statiques définis dans le composant
  private readonly STATIC_COURSES_COUNT = 11;
  
  // État de chargement
  isLoading = signal(true);
  publishedVideosCount = signal(0);
  
  // Récupérer le nom de l'utilisateur depuis le service auth
  get userName(): string {
    const user = this.authService.currentUser();
    return user?.full_name || user?.username || 'Apprenant';
  }

  // Progress stats
  progressStats = [
    { label: 'Cours disponibles', value: 0, total: null, icon: 'fas fa-book-open', color: 'primary' },
    { label: 'QCM réussis', value: 0, total: 0, icon: 'fas fa-clipboard-check', color: 'success' },
    { label: 'QCM échoués', value: 0, total: null, icon: 'fas fa-times-circle', color: 'danger' },
    { label: 'Score moyen', value: 0, total: 100, icon: 'fas fa-star', color: 'info', suffix: '%' },
    { label: 'Vidéos publiées', value: 0, total: null, icon: 'fas fa-video', color: 'warning' }
  ];

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  /**
   * Charge TOUTES les statistiques du dashboard de manière synchronisée
   */
  private loadDashboardStats(): void {
    this.isLoading.set(true);

    // Attendre que TOUTES les données soient prêtes avant d'afficher
    forkJoin({
      stats: this.statisticsService.getApprenantStats(),
      courses: this.coursesService.getAllCourses(),
      videos: this.videoService.listPublishedVideos()
    }).subscribe({
      next: ({ stats, courses, videos }) => {
        // Mettre à jour les stats QCM
        this.progressStats[1].value = stats.qcm.passed;
        this.progressStats[1].total = stats.qcm.completed;
        this.progressStats[2].value = stats.qcm.failed;
        this.progressStats[3].value = stats.qcm.avg_score;
        this.progressStats[4].value = Array.isArray(videos) ? videos.length : 0;
        this.publishedVideosCount.set(Array.isArray(videos) ? videos.length : 0);

        // Calculer et afficher le total de cours depuis la base de données
        const totalCourses = courses.length;
        this.progressStats[0].value = totalCourses;
        
        console.log(`✅ Stats chargées: ${this.STATIC_COURSES_COUNT} cours statiques + ${dynamicCoursesCount} dynamiques = ${totalCourses}`);
        console.log(`   QCM - Réussis: ${stats.qcm.passed}, Échoués: ${stats.qcm.failed}, Moyenne: ${stats.qcm.avg_score}%`);

        // Arrêter le spinner une fois les données affichées
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement des statistiques:', err);
        // En cas d'erreur, afficher au minimum les cours statiques
        this.progressStats[0].value = this.STATIC_COURSES_COUNT;
        this.progressStats[1].value = 0;
        this.progressStats[2].value = 0;
        this.progressStats[3].value = 0;
        this.progressStats[4].value = 0;
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Méthode pour rafraîchir les stats (peut être appelée au clic sur le profil, etc.)
   */
  refreshStats(): void {
    console.log('🔄 Rafraîchissement des statistiques...');
    this.loadDashboardStats();
  }

  // Current courses (11 specific courses)
  currentCourses = signal([
    { id: 1, title: 'Distance d\'arrêt', icon: '📏', category: 'Sécurité', duration: '35 min', progress: 85, lessons: 7, completed: 6, totalPages: 6 },
    { id: 2, title: 'Angles morts', icon: '👁️', category: 'Sécurité', duration: '28 min', progress: 60, lessons: 6, completed: 4, totalPages: 7 },
    { id: 3, title: 'Alcool : les effets', icon: '🍷', category: 'Sécurité', duration: '32 min', progress: 30, lessons: 8, completed: 2, totalPages: 5 },
    { id: 4, title: 'Adhérence', icon: '🛑', category: 'Physique', duration: '25 min', progress: 75, lessons: 5, completed: 4, totalPages: 6 },
    { id: 5, title: 'Champ visuel', icon: '👀', category: 'Sécurité', duration: '22 min', progress: 45, lessons: 5, completed: 2, totalPages: 6 },
    { id: 6, title: 'Alcool : les doses', icon: '⚠️', category: 'Sécurité', duration: '20 min', progress: 50, lessons: 4, completed: 2, totalPages: 5 },
    { id: 7, title: 'Temps de réaction', icon: '⚡', category: 'Physique', duration: '30 min', progress: 90, lessons: 6, completed: 5, totalPages: 9 },
    { id: 8, title: 'Téléphone mobile', icon: '📱', category: 'Sécurité', duration: '18 min', progress: 40, lessons: 4, completed: 2, totalPages: 5 },
    { id: 9, title: 'Cannabis : les effets', icon: '🚫', category: 'Sécurité', duration: '28 min', progress: 55, lessons: 7, completed: 4, totalPages: 5 },
    { id: 10, title: 'Ceintures de sécurité', icon: '🔒', category: 'Sécurité', duration: '15 min', progress: 70, lessons: 3, completed: 2, totalPages: 6 },
    { id: 11, title: 'Premiers secours', icon: '🏥', category: 'Sécurité', duration: '50 min', progress: 30, lessons: 10, completed: 3, totalPages: 7 }
  ]);

  // Available courses count
  availableCoursesCount = computed(() => this.currentCourses().length);

  // Recent QCM results
  recentQcm = [
    { title: 'QCM Code de la route', score: 85, total: 20, correct: 17, date: 'Il y a 2 jours', passed: true },
    { title: 'QCM Signalisation', score: 70, total: 15, correct: 11, date: 'Il y a 5 jours', passed: true },
    { title: 'QCM Conduite défensive', score: 55, total: 20, correct: 11, date: 'Il y a 1 semaine', passed: false }
  ];

  // Recommended courses
  recommendedCourses = [
    { id: 4, title: 'Conduite de nuit', description: 'Apprenez les règles de sécurité pour conduire la nuit', duration: '1h 30min', level: 'Intermédiaire' },
    { id: 5, title: 'Éco-conduite', description: 'Techniques pour une conduite économique et écologique', duration: '1h 00min', level: 'Débutant' }
  ];

  // Weekly progress chart
  weeklyChartData = signal<ChartData<'line'>>({
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [
      {
        label: 'Minutes d\'étude',
        data: [45, 60, 30, 90, 120, 75, 45],
        borderColor: '#1565c0',
        backgroundColor: 'rgba(21, 101, 192, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  });

  weeklyChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  // Skills radar chart
  skillsChartData = signal<ChartData<'radar'>>({
    labels: ['Code route', 'Signalisation', 'Premiers secours', 'Conduite', 'Sécurité'],
    datasets: [
      {
        label: 'Vos compétences',
        data: [85, 70, 45, 60, 75],
        backgroundColor: 'rgba(21, 101, 192, 0.2)',
        borderColor: '#1565c0',
        borderWidth: 2,
        pointBackgroundColor: '#1565c0'
      }
    ]
  });

  skillsChartOptions: ChartConfiguration<'radar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100
      }
    }
  };

  getProgressColor(progress: number): string {
    if (progress >= 80) return '#2e7d32';
    if (progress >= 50) return '#ff6f00';
    return '#1565c0';
  }
}

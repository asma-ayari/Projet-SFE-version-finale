import { Component, signal, computed, inject, OnInit, AfterViewInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { ChartConfiguration, ChartData, Chart, registerables } from 'chart.js';
import { AuthService } from '../../core/services/auth.service';
import { StatisticsService } from '../../core/services/statistics';
import { CoursService } from '../../core/services/cours';
import { VideoService } from '../../core/services/video.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

Chart.register(...registerables);

interface Cours {
  id: number;
  titre: string;
  categorie: string;
  status: 'publie' | 'brouillon' | 'archive';
  dateCreation: Date;
  vues: number;
  inscrits: number;
  completion: number;
  note: number;
  thumbnail: string;
}

interface FormateurNavItem {
  label: string;
  icon: string;
  route: string;
  fragment?: string;
}

@Component({
  selector: 'app-formateur-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, AfterViewInit {
  private authService = inject(AuthService);
  private statisticsService = inject(StatisticsService);
  private coursService = inject(CoursService);
  private videoService = inject(VideoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  currentDate = new Date();

  // Nombre de cours statiques définis dans le composant
  private readonly STATIC_COURSES_COUNT = 11;
  isSidebarOpen = signal(true);
  private readonly SIDEBAR_STATE_KEY = 'formateur-dashboard-sidebar-state';
  private readonly imageByTitle: Record<string, string> = {
    'distance d arret': 'distance-arret.png',
    'angles morts': 'angles-mort.png',
    'alcool les effets': 'alccol-effets.png',
    'adherence': 'adherence.png',
    'champ visuel': 'champs-visuel.png',
    'alcool les doses': 'alcool-doses.png',
    'temps de reaction': 'temps-reaction.png',
    'telephone mobile': 'telephone-mobile.png',
    'cannabis les effets': 'connabis-effect.png',
    'ceintures de securite': 'ceinture-securite.png',
    'premiers secours': 'premiers-secours.png'
  };

  // Récupérer le nom du formateur depuis le service auth
  get formateurName(): string {
    const user = this.authService.currentUser();
    return user?.full_name || user?.username || 'Formateur';
  }

  // KPIs
  kpis = signal([
    { title: 'Mes Cours', value: 11 as number | string, icon: 'fas fa-book-open', color: 'primary', change: '' },
    { title: 'Cours Publiés', value: 10 as number | string, icon: 'fas fa-user-graduate', color: 'success', change: '' },
    { title: 'Brouillons', value: 1 as number | string, icon: 'fas fa-check-circle', color: 'warning', change: '' },
    { title: 'Note Moyenne', value: '4.7' as number | string, icon: 'fas fa-star', color: 'info', change: 'sur 5 étoiles' }
  ]);

  // Images management
  failedImageIds = signal<Set<number>>(new Set());

  navItems: FormateurNavItem[] = [
    { label: 'Tableau de bord', icon: 'fas fa-home', route: '/formateur/dashboard' },
    { label: 'Gérer cours', icon: 'fas fa-cog', route: '/formateur/cours' },
    { label: 'Gérer vidéo', icon: 'fas fa-film', route: '/formateur/videos-manage' },
    { label: 'Mon Profil', icon: 'fas fa-user', route: '/formateur/profile' }
  ];

  totalPublishedCourses = computed(() => this.mesCours().filter(c => c.status === 'publie').length);
  totalEnrolledLearners = computed(() => this.mesCours().reduce((sum, c) => sum + (c.inscrits || 0), 0));
  averageCourseRating = computed(() => {
    const rated = this.mesCours().filter(c => c.note > 0);
    if (!rated.length) return '0.0';
    const avg = rated.reduce((sum, c) => sum + c.note, 0) / rated.length;
    return avg.toFixed(1);
  });
  averageCompletionRate = computed(() => {
    const published = this.mesCours().filter(c => c.status === 'publie');
    if (!published.length) return 0;
    return Math.round(published.reduce((sum, c) => sum + (c.completion || 0), 0) / published.length);
  });

  // Nombre de vidéos publiées
  totalPublishedVideos = signal<number>(0);

  quickPublishedCourses = computed(() =>
    this.mesCours()
      .filter(c => c.status === 'publie')
      .sort((a, b) => b.dateCreation.getTime() - a.dateCreation.getTime())
      .slice(0, 3)
  );
  courseStats = computed(() => {
    const total = this.mesCours().length;
    const published = this.mesCours().filter(c => c.status === 'publie').length;
    const draft = this.mesCours().filter(c => c.status === 'brouillon').length;
    return { total, published, draft };
  });
  courseThemes = computed(() => {
    const counts = new Map<string, number>();
    this.mesCours().forEach((c) => {
      const key = (c.categorie || 'general').toLowerCase();
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count);
  });

  ngOnInit(): void {
    this.loadSidebarState();
    this.loadDashboardStats();
    this.loadFormateurCourses();
    this.loadTotalPublishedVideos();
  }

  ngAfterViewInit(): void {
    this.route.fragment
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((fragment) => {
        if (!fragment) return;
        const element = document.getElementById(fragment);
        if (element) {
          setTimeout(() => element.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
        }
      });
  }

  private loadSidebarState(): void {
    const savedState = localStorage.getItem(this.SIDEBAR_STATE_KEY);
    if (savedState !== null) {
      this.isSidebarOpen.set(savedState === 'open');
    }
  }

  private saveSidebarState(): void {
    localStorage.setItem(this.SIDEBAR_STATE_KEY, this.isSidebarOpen() ? 'open' : 'closed');
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
    this.saveSidebarState();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Transforme une donnée backend en objet Cours avec le bon typage
   */
  private transformToCoursObject(c: any, isPublished: boolean = false): Cours {
    const status: 'publie' | 'brouillon' | 'archive' =
      isPublished ? 'publie' : (c.is_published ? 'publie' : 'brouillon');

    return {
      id: c.id,
      titre: c.title || c.titre,
      categorie: c.category || c.categorie,
      status,
      dateCreation: c.created_at ? new Date(c.created_at) : new Date(),
      vues: c.vues || 0,
      inscrits: c.inscrits || 0,
      completion: c.completion || 0,
      note: c.note || 0,
      thumbnail: c.thumbnail || '📚'
    };
  }

  /**
   * Charge les statistiques du dashboard formateur
   */
  private loadDashboardStats(): void {
    this.statisticsService.getFormateurStats().subscribe({
      next: (stats) => {
        // Calculer le total des cours (statiques + dynamiques)
        const dynamicCoursesCount = stats.courses.total - this.STATIC_COURSES_COUNT;
        const totalCourses = this.STATIC_COURSES_COUNT + Math.max(0, dynamicCoursesCount);

        const updatedKpis = [...this.kpis()];
        updatedKpis[0].value = totalCourses;
        updatedKpis[1].value = stats.courses.published;
        updatedKpis[2].value = stats.courses.draft;
        this.kpis.set(updatedKpis);

        console.log(`✅ Cours chargés: ${this.STATIC_COURSES_COUNT} cours statiques + ${Math.max(0, dynamicCoursesCount)} dynamiques = ${totalCourses}`);
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement des statistiques:', err);
        // Garder les valeurs par défaut (11 cours)
      }
    });
  }

  /**
   * Méthode pour rafraîchir les stats
   */
  refreshStats(): void {
    console.log('🔄 Rafraîchissement des statistiques...');
    this.loadDashboardStats();
  }

  /**
   * État de chargement des cours
   */
  loadingCours = signal(false);

  // Cours du formateur - 11 cours statiques
  mesCours = signal<Cours[]>([
    { id: 1, titre: 'Distance d\'arrêt', categorie: 'Sécurité', status: 'publie', dateCreation: new Date('2025-11-15'), vues: 1250, inscrits: 320, completion: 92, note: 4.8, thumbnail: '📏' },
    { id: 2, titre: 'Angles morts', categorie: 'Sécurité', status: 'publie', dateCreation: new Date('2025-12-01'), vues: 980, inscrits: 245, completion: 87, note: 4.7, thumbnail: '👁️' },
    { id: 3, titre: 'Alcool : les effets', categorie: 'Sécurité', status: 'publie', dateCreation: new Date('2026-01-10'), vues: 756, inscrits: 189, completion: 78, note: 4.6, thumbnail: '🍷' },
    { id: 4, titre: 'Adhérence', categorie: 'Physique', status: 'publie', dateCreation: new Date('2026-02-01'), vues: 654, inscrits: 178, completion: 81, note: 4.5, thumbnail: '🛑' },
    { id: 5, titre: 'Champ visuel', categorie: 'Sécurité', status: 'publie', dateCreation: new Date('2025-10-20'), vues: 654, inscrits: 178, completion: 81, note: 4.4, thumbnail: '👀' },
    { id: 6, titre: 'Alcool : les doses', categorie: 'Sécurité', status: 'publie', dateCreation: new Date('2025-09-15'), vues: 543, inscrits: 145, completion: 75, note: 4.5, thumbnail: '⚠️' },
    { id: 7, titre: 'Temps de réaction', categorie: 'Physique', status: 'publie', dateCreation: new Date('2025-08-20'), vues: 789, inscrits: 210, completion: 85, note: 4.7, thumbnail: '⚡' },
    { id: 8, titre: 'Téléphone mobile', categorie: 'Sécurité', status: 'publie', dateCreation: new Date('2025-07-10'), vues: 432, inscrits: 120, completion: 70, note: 4.3, thumbnail: '📱' },
    { id: 9, titre: 'Cannabis : les effets', categorie: 'Sécurité', status: 'brouillon', dateCreation: new Date('2026-02-01'), vues: 0, inscrits: 0, completion: 0, note: 0, thumbnail: '🚫' },
    { id: 10, titre: 'Ceintures de sécurité', categorie: 'Sécurité', status: 'publie', dateCreation: new Date('2025-06-15'), vues: 621, inscrits: 165, completion: 88, note: 4.9, thumbnail: '🔒' },
    { id: 11, titre: 'Premiers secours', categorie: 'Sécurité', status: 'publie', dateCreation: new Date('2025-05-20'), vues: 895, inscrits: 235, completion: 92, note: 4.9, thumbnail: '🏥' }
  ]);

  // Activités récentes
  recentActivities = [
    { type: 'inscription', message: 'Ahmed Ben Ali s\'est inscrit à "Code de la route"', time: 'Il y a 10 min', icon: 'fas fa-user-plus' },
    { type: 'completion', message: 'Fatma Trabelsi a terminé "Signalisation routière"', time: 'Il y a 25 min', icon: 'fas fa-check' },
    { type: 'qcm', message: '15 apprenants ont passé le QCM du cours "Premiers secours"', time: 'Il y a 1h', icon: 'fas fa-clipboard-check' },
    { type: 'commentaire', message: 'Nouveau commentaire sur "Code de la route"', time: 'Il y a 2h', icon: 'fas fa-comment' },
    { type: 'note', message: 'Vous avez reçu une note 5 étoiles', time: 'Il y a 3h', icon: 'fas fa-star' }
  ];

  // Statistiques des inscriptions
  inscriptionsChartData: ChartData<'line'> = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    datasets: [{
      label: 'Inscriptions',
      data: [12, 19, 15, 25, 22, 30, 28],
      borderColor: '#1565c0',
      backgroundColor: 'rgba(21, 101, 192, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  inscriptionsChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } }
  };

  // Répartition par cours
  coursChartData: ChartData<'doughnut'> = {
    labels: ['Code de la route', 'Signalisation', 'Premiers secours', 'Règles priorité'],
    datasets: [{
      data: [320, 245, 189, 178],
      backgroundColor: ['#1565c0', '#ff6f00', '#2e7d32', '#0097a7'],
      borderWidth: 0
    }]
  };

  coursChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } }
  };

  // Top apprenants
  topApprenants = [
    { nom: 'Amira Maalej', coursTermines: 5, score: 95, avatar: 'A' },
    { nom: 'Hassen Cherif', coursTermines: 4, score: 92, avatar: 'H' },
    { nom: 'Ines Dridi', coursTermines: 4, score: 89, avatar: 'I' },
    { nom: 'Ahmed Ben Ali', coursTermines: 3, score: 87, avatar: 'A' },
    { nom: 'Fatma Trabelsi', coursTermines: 3, score: 85, avatar: 'F' }
  ];

  /**
   * Charge les cours du formateur depuis le backend
   */
  private loadFormateurCourses(): void {
    this.loadingCours.set(true);
    console.log('🔄 Chargement des cours depuis le backend...');

    // Charger les cours depuis le backend via CoursService
    this.coursService.manageList(1, 50).subscribe({
      next: (response) => {
        console.log('📦 Réponse brute de manageList:', response);
        console.log('📦 response.courses:', response.courses);
        console.log('📦 response.courses.length:', response.courses?.length);

        if (!response.courses || response.courses.length === 0) {
          console.warn('⚠️ Pas de cours reçus du backend');
          // Garder les données statiques comme fallback
          this.updateCoursesKpis(this.mesCours());
          this.loadingCours.set(false);
          return;
        }

        console.log('✅ Cours chargés depuis backend:', response.courses.length);

        // Transformer les courses du backend au format frontend
        const coursFrontend = response.courses.map(c => ({
          id: c.id,
          titre: c.title,
          categorie: c.category,
          status: c.is_published ? 'publie' : 'brouillon' as 'publie' | 'brouillon',
          dateCreation: c.created_at ? new Date(c.created_at) : new Date(),
          vues: 0, // Backend n'a pas ce champ
          inscrits: 0, // Backend n'a pas ce champ
          completion: 0, // Backend n'a pas ce champ
          note: 0,
          thumbnail: '📚'
        }));

        console.log('✅ Courses transformés frontend:', coursFrontend.length);
        this.mesCours.set(coursFrontend);
        this.updateCoursesKpis(coursFrontend);
        this.loadingCours.set(false);
      },
      error: (err) => {
        console.error('❌ Erreur chargement backend:', err);
        console.error('  Status:', err.status);
        console.error('  Message:', err.error?.detail || err.message);
        // Garder les données statiques comme fallback
        console.log('⚠️ Utilisation des données statiques comme fallback');
        this.updateCoursesKpis(this.mesCours());
        this.loadingCours.set(false);
      }
    });
  }

  /**
   * Met à jour les KPIs en fonction des cours chargés
   */
  private updateCoursesKpis(cours: Cours[]): void {
    const published = cours.filter(c => c.status === 'publie').length;
    const draft = cours.filter(c => c.status === 'brouillon').length;

    const updatedKpis = [...this.kpis()];
    updatedKpis[0].value = cours.length;
    updatedKpis[1].value = published;
    updatedKpis[2].value = draft;
    this.kpis.set(updatedKpis);

    console.log(`📊 KPIs mis à jour: ${cours.length} total, ${published} publiés, ${draft} brouillons`);
  }

  /**
   * Rafraîchit les cours depuis le backend
   */
  refreshCourses(): void {
    console.log('🔄 Rafraîchissement des cours...');
    this.loadFormateurCourses();
  }


  /**
   * Charge le nombre total de vidéos publiées pour le formateur
   */
  private loadTotalPublishedVideos(): void {
    console.log('🔄 Chargement du nombre de vidéos publiées...');
    this.videoService.listVideos()
      .subscribe({
        next: (videos) => {
          const count = Array.isArray(videos) ? videos.length : 0;
          this.totalPublishedVideos.set(count);
          console.log('✅ Vidéos chargées:', count);
        },
        error: (err) => {
          console.error('❌ Erreur lors du chargement des vidéos:', err);
          this.totalPublishedVideos.set(0);
        }
      });
  }



  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'publie': return 'Publié';
      case 'brouillon': return 'Brouillon';
      default: return 'Archivé';
    }
  }

  getActivityClass(type: string): string {
    return `activity-${type}`;
  }

  private normalizeTitle(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[:'’]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  getCourseImagePath(cours: Cours): string {
    const mapped = this.imageByTitle[this.normalizeTitle(cours.titre || '')];
    return mapped ? `assets/cours/${mapped}` : '';
  }

  hasImageError(courseId: number): boolean {
    return this.failedImageIds().has(courseId);
  }

  onImageError(courseId: number): void {
    this.failedImageIds.update((prev) => {
      const next = new Set(prev);
      next.add(courseId);
      return next;
    });
  }

  /**
   * Voir le contenu du cours en mode lecture seule
   */
  viewCours(cours: Cours): void {
    console.log('👁️ Affichage du cours en lecture seule:', cours.titre);
    this.router.navigate(['/formateur/cours', cours.id, 'voir'], {
      state: { cours }
    });
  }

  /**
   * Modifier le contenu du cours
   */
  editCours(cours: Cours): void {
    console.log('✏️ Modification du cours:', cours.titre);
    this.router.navigate(['/formateur/cours', cours.id, 'modifier'], {
      state: { cours }
    });
  }

  /**
   * Voir les statistiques du cours
   */
  viewStatistics(cours: Cours): void {
    console.log('📊 Statistiques du cours:', cours.titre);
    this.router.navigate(['/formateur/cours', cours.id, 'statistiques'], {
      state: { cours }
    });
  }

  /**
   * Retourne la classe CSS appropriée pour le badge de difficulté
   */
  getDifficultyClass(difficulty: string): string {
    return `difficulty-${difficulty?.toLowerCase() || 'moyen'}`;
  }


}

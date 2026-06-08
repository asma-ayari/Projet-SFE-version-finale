import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize } from 'rxjs/operators';
import { CoursService, CourseItem } from '../../core/services/cours';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cours-manage',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule],
  templateUrl: './cours-manage.html',
  styleUrl: './cours-manage.css',
})
export class CoursManage implements OnInit {
  private authService = inject(AuthService);
  private translate = inject(TranslateService);
  courses = signal<CourseItem[]>([]);
  failedImageIds = signal<Set<number>>(new Set());
  total = signal(0);
  page = signal(1);
  pages = signal(1);
  private readonly pageSize = 50;
  loading = signal(false);
  error = signal('');
  success = signal('');
  filterCategory = signal('');
  private readonly staticCourses: CourseItem[] = [
    {
      id: 1,
      title: "Distance d'arrêt",
      description: "Comprendre les facteurs qui influencent la distance d'arrêt et comment l'anticiper.",
      category: 'conduite',
      level: 'debutant',
      duration: '1h 30min',
      image: 'distance-arret.png',
      is_published: true,
      order: 1,
    },
    {
      id: 2,
      title: 'Angles morts',
      description: 'Identifier et gerer les zones non visibles autour de votre vehicule.',
      category: 'securite',
      level: 'debutant',
      duration: '1h 15min',
      image: 'angles-mort.png',
      is_published: true,
      order: 2,
    },
    {
      id: 3,
      title: 'Alcool : les effets',
      description: "Les effets de l'alcool sur la conduite et les capacites du conducteur.",
      category: 'securite',
      level: 'debutant',
      duration: '1h 45min',
      image: 'alccol-effets.png',
      is_published: true,
      order: 3,
    },
    {
      id: 4,
      title: 'Adherence',
      description: "Maitriser l'adherence du vehicule selon les conditions meteorologiques.",
      category: 'conduite',
      level: 'intermediaire',
      duration: '1h 30min',
      image: 'adherence.png',
      is_published: true,
      order: 4,
    },
    {
      id: 5,
      title: 'Champ visuel',
      description: 'Optimiser votre champ de vision pour une conduite plus sure.',
      category: 'conduite',
      level: 'debutant',
      duration: '1h 20min',
      image: 'champs-visuel.png',
      is_published: true,
      order: 5,
    },
    {
      id: 6,
      title: 'Alcool : les doses',
      description: "Comprendre les limites legales et les equivalences en alcool.",
      category: 'securite',
      level: 'debutant',
      duration: '1h 15min',
      image: 'alcool-doses.png',
      is_published: true,
      order: 6,
    },
    {
      id: 7,
      title: 'Temps de reaction',
      description: "Facteurs influencant le temps de reaction et comment l'ameliorer.",
      category: 'conduite',
      level: 'intermediaire',
      duration: '1h 40min',
      image: 'temps-reaction.png',
      is_published: true,
      order: 7,
    },
    {
      id: 8,
      title: 'Telephone mobile',
      description: 'Les dangers du telephone au volant et la reglementation en vigueur.',
      category: 'securite',
      level: 'debutant',
      duration: '1h 10min',
      image: 'telephone-mobile.png',
      is_published: true,
      order: 8,
    },
    {
      id: 9,
      title: 'Cannabis : les effets',
      description: 'Impact du cannabis sur les capacites de conduite et risques legaux.',
      category: 'securite',
      level: 'debutant',
      duration: '1h 30min',
      image: 'connabis-effect.png',
      is_published: true,
      order: 9,
    },
    {
      id: 10,
      title: 'Ceintures de securite',
      description: "L'importance de la ceinture et son utilisation correcte pour tous les passagers.",
      category: 'securite',
      level: 'debutant',
      duration: '1h 00min',
      image: 'ceinture-securite.png',
      is_published: true,
      order: 10,
    },
    {
      id: 11,
      title: 'Premiers secours',
      description: "Gestes essentiels pour porter secours en cas d'accident de la route.",
      category: 'secours',
      level: 'intermediaire',
      duration: '2h 00min',
      image: 'premiers-secours.png',
      is_published: true,
      order: 11,
    },
  ];

  constructor(private coursService: CoursService) { }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading.set(true);
    console.log('🚀 Chargement des cours...', { page: this.page(), category: this.filterCategory() });
    const category = this.filterCategory() || undefined;
    this.coursService.manageList(this.page(), this.pageSize, category)
      .pipe(
        finalize(() => {
          this.loading.set(false);
          console.log('✅ Chargement terminé (finalize)');
        })
      )
      .subscribe({
        next: (response) => {
          const courses = response?.courses || [];
          console.log('✅ Cours reçus (manage):', courses.length);
          this.courses.set(courses);
          this.total.set(response?.total ?? courses.length);
          this.pages.set(response?.pages ?? 1);
          this.page.set(response?.page ?? this.page());
        },
        error: (err) => {
          console.error('❌ Erreur:', err);
          const fallback = this.getStaticCourses(category);
          this.courses.set(fallback);
          this.total.set(fallback.length);
          this.pages.set(1);
          this.page.set(1);
          this.error.set(err.error?.detail || this.translate.instant('FORMATEUR.COURS_MANAGE.MESSAGES.LOAD_ERROR'));
        }
      });
  }

  onFilter() {
    this.page.set(1);
    this.load();
  }

  onFilterChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    console.log('🔄 Filtre changé:', value);
    this.filterCategory.set(value);
    this.page.set(1);
    this.load();
  }

  goPage(p: number) {
    this.page.set(p);
    this.load();
  }

  canManage(course: CourseItem): boolean {
    const userId = this.authService.currentUser()?.id;
    return !!userId && course.created_by === userId;
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

  getCourseTitleLabel(course: CourseItem): string {
    const translationKey = `COURSE_DETAIL_ID${course.id}.COURSE_TITLE`;
    const translated = this.translate.instant(translationKey);
    return translated !== translationKey ? translated : course.title;
  }

  getCourseCategoryLabel(course: CourseItem): string {
    const normalized = this.normalizeTitle(course.category || '')
      .replace(/[^a-z0-9 ]/g, ' ')
      .replace(/\s+/g, '_')
      .toUpperCase();

    const translationKey = `FORMATEUR.COURS_MANAGE.CATEGORIES.${normalized}`;
    const translated = this.translate.instant(translationKey);
    return translated !== translationKey ? translated : course.category;
  }

  getCourseDurationLabel(course: CourseItem): string {
    const duration = course.duration || '—';
    const currentLang = (this.translate.currentLang || this.translate.defaultLang || 'fr').toLowerCase();

    if (!currentLang.startsWith('ar')) {
      return duration;
    }

    return duration
      .replace(/min\b/gi, 'دق')
      .replace(/\s+/g, ' ')
      .trim();
  }

  togglePublish(course: CourseItem) {
    this.coursService.togglePublish(course.id).subscribe({
      next: (res) => {
        course.is_published = res.is_published;
        this.success.set(
          this.translate.instant('FORMATEUR.COURS_MANAGE.MESSAGES.PUBLISH_TOGGLE_SUCCESS', {
            title: course.title,
            status: this.translate.instant(
              res.is_published
                ? 'FORMATEUR.COURS_MANAGE.STATUS.PUBLISHED'
                : 'FORMATEUR.COURS_MANAGE.STATUS.UNPUBLISHED'
            ),
          })
        );
        setTimeout(() => this.success.set(''), 3000);
      },
      error: () => this.error.set(this.translate.instant('FORMATEUR.COURS_MANAGE.MESSAGES.PUBLISH_ERROR'))
    });
  }

  deleteCourse(course: CourseItem) {
    if (!confirm(this.translate.instant('FORMATEUR.COURS_MANAGE.MESSAGES.DELETE_CONFIRM', { title: course.title }))) return;
    this.coursService.delete(course.id).subscribe({
      next: () => {
        this.success.set(this.translate.instant('FORMATEUR.COURS_MANAGE.MESSAGES.DELETE_SUCCESS'));
        this.load();
        setTimeout(() => this.success.set(''), 3000);
      },
      error: () => this.error.set(this.translate.instant('FORMATEUR.COURS_MANAGE.MESSAGES.DELETE_ERROR'))
    });
  }

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

  private getStaticCourses(category?: string): CourseItem[] {
    if (!category) {
      return [...this.staticCourses];
    }
    return this.staticCourses.filter((course) => course.category === category);
  }

  getCourseImagePath(course: CourseItem): string {
    const normalizedTitle = this.normalizeTitle(course.title || '');
    const mapped = this.imageByTitle[normalizedTitle];
    if (mapped) {
      return `assets/cours/${mapped}`;
    }

    if (course.image) {
      return `assets/cours/${course.image}`;
    }

    if (course.image_url) {
      return course.image_url;
    }

    return '';
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
}

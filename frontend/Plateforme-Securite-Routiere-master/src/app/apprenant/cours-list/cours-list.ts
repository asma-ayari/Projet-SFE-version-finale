import { Component, signal, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ChatbotWidgetComponent } from '../../shared/chatbot-widget/chatbot-widget';
import { CoursService, CourseItem } from '../../core/services/cours';
import { LanguageService } from '../../core/services/language.service';
import { environment } from '../../../environments/environment';

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  lessons: number;
  totalPages: number;
  rating: number;
  students: number;
  image?: string;
  imageUrl?: string;
  instructor: string;
  progress?: number;
}

@Component({
  selector: 'app-cours-list',
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule, ChatbotWidgetComponent],
  templateUrl: './cours-list.html',
  styleUrl: './cours-list.css',
})
export class CoursList implements OnInit, OnDestroy {
  private translate = inject(TranslateService);
  private coursService = inject(CoursService);
  private languageService = inject(LanguageService);
  private readonly backendUrl = environment.apiUrl;
  private readonly staticCourseIds = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  searchQuery = signal('');
  selectedCategory = signal('all');
  selectedLevel = signal('all');
  languageVersion = signal(0);
  failedImageIds = signal<Set<number>>(new Set());
  loadingDynamic = signal(false);

  private readonly langSub = this.translate.onLangChange.subscribe(() => {
    this.languageVersion.update((v) => v + 1);
    this.loadPublishedCourses();
  });

  private readonly courseTranslations: Record<number, { fr: { title: string; description: string }; ar: { title: string; description: string } }> = {
    1: {
      fr: {
        title: 'Distance d\'arrêt',
        description: 'Comprendre les facteurs qui influencent la distance d\'arrêt et comment l\'anticiper.'
      },
      ar: {
        title: 'مسافة التوقف',
        description: 'فهم العوامل التي تؤثر على مسافة التوقف وكيفية توقعها.'
      }
    },
    2: {
      fr: {
        title: 'Angles morts',
        description: 'Identifier et gérer les zones non visibles autour de votre véhicule.'
      },
      ar: {
        title: 'النقاط العمياء',
        description: 'تحديد وإدارة المناطق غير المرئية حول مركبتك.'
      }
    },
    3: {
      fr: {
        title: 'Alcool : les effets',
        description: 'Les effets de l\'alcool sur la conduite et les capacités du conducteur.'
      },
      ar: {
        title: 'الكحول: التأثيرات',
        description: 'تأثير الكحول على القيادة وقدرات السائق.'
      }
    },
    4: {
      fr: {
        title: 'Adhérence',
        description: 'Maîtriser l\'adhérence du véhicule selon les conditions météorologiques.'
      },
      ar: {
        title: 'التماسك',
        description: 'إتقان تماسك المركبة وفقًا للظروف الجوية.'
      }
    },
    5: {
      fr: {
        title: 'Champ visuel',
        description: 'Optimiser votre champ de vision pour une conduite plus sûre.'
      },
      ar: {
        title: 'المجال البصري',
        description: 'تحسين مجال الرؤية لقيادة أكثر أمانًا.'
      }
    },
    6: {
      fr: {
        title: 'Alcool : les doses',
        description: 'Comprendre les limites légales et les équivalences en alcoolémie.'
      },
      ar: {
        title: 'الكحول: الجرعات',
        description: 'فهم الحدود القانونية ومعادلات نسبة الكحول في الدم.'
      }
    },
    7: {
      fr: {
        title: 'Temps de réaction',
        description: 'Facteurs influençant le temps de réaction et comment l\'améliorer.'
      },
      ar: {
        title: 'زمن رد الفعل',
        description: 'العوامل المؤثرة على زمن رد الفعل وكيفية تحسينه.'
      }
    },
    8: {
      fr: {
        title: 'Téléphone mobile',
        description: 'Les dangers du téléphone au volant et la réglementation en vigueur.'
      },
      ar: {
        title: 'الهاتف المحمول',
        description: 'مخاطر الهاتف أثناء القيادة والتشريعات المعمول بها.'
      }
    },
    9: {
      fr: {
        title: 'Cannabis : les effets',
        description: 'Impact du cannabis sur les capacités de conduite et risques légaux.'
      },
      ar: {
        title: 'القنب: التأثيرات',
        description: 'تأثير القنب على قدرات القيادة والمخاطر القانونية.'
      }
    },
    10: {
      fr: {
        title: 'Ceintures de sécurité',
        description: 'L\'importance de la ceinture et son utilisation correcte pour tous les passagers.'
      },
      ar: {
        title: 'أحزمة الأمان',
        description: 'أهمية حزام الأمان واستخدامه الصحيح لجميع الركاب.'
      }
    },
    11: {
      fr: {
        title: 'Premiers secours',
        description: 'Gestes essentiels pour porter secours en cas d\'accident de la route.'
      },
      ar: {
        title: 'الإسعافات الأولية',
        description: 'الإجراءات الأساسية لتقديم المساعدة في حالة حادث مرور.'
      }
    }
  };

  categories = [
    { value: 'all', label: 'COURSES_PAGE.ALL_CATEGORIES' },
    { value: 'conduite', label: 'COURSES_PAGE.CATEGORIES.CONDUITE' },
    { value: 'securite', label: 'COURSES_PAGE.CATEGORIES.SECURITE' },
    { value: 'secours', label: 'COURSES_PAGE.CATEGORIES.SECOURS' },
    { value: 'signalisation', label: 'COURSES_PAGE.CATEGORIES.SIGNALISATION' },
    { value: 'general', label: 'COURSES_PAGE.CATEGORIES.GENERAL' },
    { value: 'physique', label: 'COURSES_PAGE.CATEGORIES.PHYSIQUE' }
  ];

  levels = [
    { value: 'all', label: 'COURSES.ALL_LEVELS' },
    { value: 'debutant', label: 'COURSES.LEVEL_BEGINNER' },
    { value: 'intermediaire', label: 'COURSES.LEVEL_INTERMEDIATE' }
  ];

  courses = signal<Course[]>([]);

  ngOnInit(): void {
    this.courses.set([...this.staticCourses]);
    this.loadPublishedCourses();
  }

  private loadPublishedCourses(): void {
    const lang = this.languageService.getCurrentLang();
    this.loadingDynamic.set(true);
    this.coursService.listPublished(undefined, undefined, lang).subscribe({
      next: (apiCourses) => {
        const dynamic = apiCourses
          .filter((c) => !this.staticCourseIds.has(c.id))
          .map((c) => this.mapApiCourse(c));
        this.failedImageIds.set(new Set());
        this.courses.set([...this.staticCourses, ...dynamic]);
        this.loadingDynamic.set(false);
      },
      error: () => {
        this.courses.set([...this.staticCourses]);
        this.loadingDynamic.set(false);
      },
    });
  }

  private mapApiCourse(c: CourseItem): Course {
    const resolvedImage = this.coursService.resolveImageUrl(c.image_url);
    return {
      id: c.id,
      title: c.title,
      description: c.description || '',
      category: c.category,
      level: c.level || 'debutant',
      duration: c.duration || '—',
      lessons: 1,
      totalPages: 1,
      rating: 0,
      students: 0,
      imageUrl: resolvedImage || c.image_url,
      instructor: 'Formateur',
    };
  }

  private readonly staticCourses: Course[] = [
    {
      id: 1,
      title: 'Distance d\'arrêt',
      description: 'Comprendre les facteurs qui influencent la distance d\'arrêt et comment l\'anticiper.',
      category: 'conduite',
      level: 'debutant',
      duration: '1h 30min',
      lessons: 6,
      totalPages: 6,
      rating: 4.8,
      students: 1250,
      image: 'distance-arret.png',
      instructor: 'Mohamed Ben Ali',
      progress: 17
    },
    {
      id: 2,
      title: 'Angles morts',
      description: 'Identifier et gérer les zones non visibles autour de votre véhicule.',
      category: 'securite',
      level: 'debutant',
      duration: '1h 15min',
      lessons: 6,
      totalPages: 7,
      rating: 4.7,
      students: 980,
      image: 'angles-mort.png',
      instructor: 'Fatma Trabelsi'
    },
    {
      id: 3,
      title: 'Alcool : les effets',
      description: 'Les effets de l\'alcool sur la conduite et les capacités du conducteur.',
      category: 'securite',
      level: 'debutant',
      duration: '1h 45min',
      lessons: 6,
      totalPages: 5,
      rating: 4.9,
      students: 1100,
      image: 'alccol-effets.png',
      instructor: 'Dr. Karim Sfar'
    },
    {
      id: 4,
      title: 'Adhérence',
      description: 'Maîtriser l\'adhérence du véhicule selon les conditions météorologiques.',
      category: 'conduite',
      level: 'intermediaire',
      duration: '1h 30min',
      lessons: 6,
      totalPages: 6,
      rating: 4.6,
      students: 890,
      image: 'adherence.png',
      instructor: 'Ahmed Gharbi'
    },
    {
      id: 5,
      title: 'Champ visuel',
      description: 'Optimiser votre champ de vision pour une conduite plus sûre.',
      category: 'conduite',
      level: 'debutant',
      duration: '1h 20min',
      lessons: 6,
      totalPages: 6,
      rating: 4.5,
      students: 756,
      image: 'champs-visuel.png',
      instructor: 'Sarra Jebali'
    },
    {
      id: 6,
      title: 'Alcool : les doses',
      description: 'Comprendre les limites légales et les équivalences en alcoolémie.',
      category: 'securite',
      level: 'debutant',
      duration: '1h 15min',
      lessons: 6,
      totalPages: 5,
      rating: 4.7,
      students: 920,
      image: 'alcool-doses.png',
      instructor: 'Dr. Karim Sfar'
    },
    {
      id: 7,
      title: 'Temps de réaction',
      description: 'Facteurs influençant le temps de réaction et comment l\'améliorer.',
      category: 'conduite',
      level: 'intermediaire',
      duration: '1h 40min',
      lessons: 6,
      totalPages: 9,
      rating: 4.8,
      students: 845,
      image: 'temps-reaction.png',
      instructor: 'Mohamed Ben Ali'
    },
    {
      id: 8,
      title: 'Téléphone mobile',
      description: 'Les dangers du téléphone au volant et la réglementation en vigueur.',
      category: 'securite',
      level: 'debutant',
      duration: '1h 10min',
      lessons: 6,
      totalPages: 5,
      rating: 4.6,
      students: 1050,
      image: 'telephone-mobile.png',
      instructor: 'Fatma Trabelsi'
    },
    {
      id: 9,
      title: 'Cannabis : les effets',
      description: 'Impact du cannabis sur les capacités de conduite et risques légaux.',
      category: 'securite',
      level: 'debutant',
      duration: '1h 30min',
      lessons: 6,
      totalPages: 5,
      rating: 4.7,
      students: 780,
      image: 'connabis-effect.png',
      instructor: 'Dr. Karim Sfar'
    },
    {
      id: 10,
      title: 'Ceintures de sécurité',
      description: 'L\'importance de la ceinture et son utilisation correcte pour tous les passagers.',
      category: 'securite',
      level: 'debutant',
      duration: '1h 00min',
      lessons: 6,
      totalPages: 6,
      rating: 4.9,
      students: 1200,
      image: 'ceinture-securite.png',
      instructor: 'Ahmed Gharbi'
    },
    {
      id: 11,
      title: 'Premiers secours',
      description: 'Gestes essentiels pour porter secours en cas d\'accident de la route.',
      category: 'secours',
      level: 'intermediaire',
      duration: '2h 00min',
      lessons: 6,
      totalPages: 7,
      rating: 4.9,
      students: 950,
      image: 'premiers-secours.png',
      instructor: 'Dr. Karim Sfar'
    }
  ];

  filteredCourses = computed(() => {
    // Make filtering react when language changes.
    this.languageVersion();

    let result = this.courses();

    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(c => 
        this.getCourseTitle(c).toLowerCase().includes(query) || 
        this.getCourseDescription(c).toLowerCase().includes(query)
      );
    }

    const category = this.selectedCategory();
    if (category !== 'all') {
      result = result.filter(c => c.category === category);
    }

    const level = this.selectedLevel();
    if (level !== 'all') {
      result = result.filter(c => c.level === level);
    }

    return result;
  });

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  onCategoryChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedCategory.set(select.value);
  }

  onLevelChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedLevel.set(select.value);
  }

  getLevelLabel(level: string): string {
    const labels: Record<string, string> = {
      'debutant': 'COURSES.LEVEL_BEGINNER',
      'intermediaire': 'COURSES.LEVEL_INTERMEDIATE',
      'avance': 'COURSES.LEVEL_ADVANCED'
    };
    return labels[level] || level;
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  getCourseImagePath(course: Course): string {
    if (course.imageUrl) {
      return course.imageUrl;
    }
    return course.image ? new URL(`assets/cours/${course.image}`, document.baseURI).toString() : '';
  }

  private getCurrentLanguage(): 'fr' | 'ar' {
    return this.translate.currentLang === 'ar' ? 'ar' : 'fr';
  }

  getCourseTitle(course: Course): string {
    if (!this.staticCourseIds.has(course.id)) {
      return course.title;
    }
    const lang = this.getCurrentLanguage();
    return this.courseTranslations[course.id]?.[lang]?.title || course.title;
  }

  getCourseDescription(course: Course): string {
    if (!this.staticCourseIds.has(course.id)) {
      return course.description;
    }
    const lang = this.getCurrentLanguage();
    return this.courseTranslations[course.id]?.[lang]?.description || course.description;
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

  ngOnDestroy(): void {
    this.langSub.unsubscribe();
  }
}

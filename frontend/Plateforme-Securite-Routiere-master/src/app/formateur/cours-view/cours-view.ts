import { Component, computed, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CourseContent, CourseContentService } from '../../core/services/course-content.service';
import { CoursService, CourseDetail } from '../../core/services/cours';

@Component({
  selector: 'app-cours-view',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './cours-view.html',
  styleUrl: './cours-view.css',
  encapsulation: ViewEncapsulation.None,
})
export class CoursView implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private coursService = inject(CoursService);
  private courseContentService = inject(CourseContentService);
  private sanitizer = inject(DomSanitizer);
  private translate = inject(TranslateService);

  course = signal<CourseDetail | null>(null);
  courseContent = signal<CourseContent | null>(null);
  loading = signal(true);
  error = signal('');
  currentLessonIndex = signal(0);

  totalLessons = computed(() => this.courseContent()?.lessons.length || 0);
  currentLesson = computed(() => this.courseContent()?.lessons[this.currentLessonIndex()] ?? null);
  currentLessonNumber = computed(() => this.currentLessonIndex() + 1);
  canGoPrev = computed(() => this.currentLessonIndex() > 0);
  canGoNext = computed(() => this.currentLessonIndex() < Math.max(0, this.totalLessons() - 1));
  progressPercent = computed(() => {
    const total = this.totalLessons();
    if (!total) {
      return 0;
    }
    return Math.round(((this.currentLessonIndex() + 1) / total) * 100);
  });
  currentLessonTitle = computed(() => {
    const lesson = this.currentLesson();
    if (!lesson) {
      return '';
    }
    const courseId = this.course()?.id;
    if (courseId) {
      const key = `COURSE_DETAIL_ID${courseId}.PAGE_${lesson.lessonNumber}_TITLE`;
      const translated = this.translate.instant(key);
      if (translated !== key) {
        return translated;
      }
    }
    return lesson.title;
  });
  currentLessonHtml = computed<SafeHtml | null>(() => {
    const lesson = this.currentLesson();
    if (!lesson) {
      return null;
    }
    const courseId = this.course()?.id;
    if (courseId) {
      const key = `COURSE_DETAIL_ID${courseId}.LESSON_${lesson.lessonNumber}_CONTENT`;
      const translated = this.translate.instant(key);
      if (translated !== key) {
        return this.sanitizer.bypassSecurityTrustHtml(this.normalizeLessonContent(translated));
      }
    }
    return this.sanitizer.bypassSecurityTrustHtml(this.normalizeLessonContent(lesson.content));
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('ID du cours manquant');
      this.loading.set(false);
      return;
    }

    const staticContent = this.courseContentService.getCourseContent(id);
    if (staticContent) {
      this.course.set({
        id,
        title: staticContent.title,
        category: staticContent.category,
        description: staticContent.description,
        duration: staticContent.duration,
        is_published: true,
        level: 'debutant',
        order: id,
      });
      this.courseContent.set(staticContent);
      this.currentLessonIndex.set(0);
      this.loading.set(false);
      return;
    }

    this.loadCourseContent(id);
  }

  private loadCourseContent(id: number): void {
    this.coursService.manageGet(id).subscribe({
      next: (course) => {
        this.applyCourse(course, id);
      },
      error: () => {
        this.coursService.getPublished(id).subscribe({
          next: (course) => {
            this.applyCourse(course, id);
          },
          error: () => {
            this.error.set('Impossible de charger le cours. Vérifiez que le cours existe et est publié.');
            this.loading.set(false);
          }
        });
      }
    });
  }

  private applyCourse(course: CourseDetail, id: number): void {
    this.course.set(course);
    const staticContent = this.courseContentService.getCourseContent(id);
    this.courseContent.set(staticContent || this.buildContentFromCourse(course));
    this.currentLessonIndex.set(0);
    this.loading.set(false);
  }

  private buildContentFromCourse(course: CourseDetail): CourseContent {
    const body = (course.content || course.description || '').trim();
    return {
      id: course.id,
      title: course.title,
      icon: 'fas fa-book',
      category: course.category,
      duration: course.duration || '',
      description: course.description || '',
      totalPages: 1,
      lessons: [
        {
          lessonNumber: 1,
          title: course.title,
          content: body || 'Aucun contenu disponible pour ce cours.',
        },
      ],
    };
  }

  prevPage(): void {
    if (!this.canGoPrev()) {
      return;
    }
    this.currentLessonIndex.update(value => Math.max(0, value - 1));
  }

  nextPage(): void {
    if (!this.canGoNext()) {
      return;
    }
    const maxIndex = this.totalLessons() - 1;
    this.currentLessonIndex.update(value => Math.min(maxIndex, value + 1));
  }

  goBack(): void {
    this.router.navigate(['/formateur/cours']);
  }

  editCourse(): void {
    const id = this.course()?.id;
    if (id) {
      this.router.navigate(['/formateur/cours', id, 'modifier'], {
        state: { cours: this.course() }
      });
    }
  }

  private normalizeLessonContent(content: string): string {
    const text = (content || '').trim();
    if (!text) {
      return '';
    }

    if (text.startsWith('<')) {
      return text;
    }

    const paragraphs = text
      .split(/\r?\n\s*\r?\n/g)
      .map(paragraph => paragraph.trim())
      .filter(Boolean)
      .map(paragraph => `<p>${this.escapeHtml(paragraph).replace(/\r?\n/g, '<br>')}</p>`);

    return `<div class="lesson-text-content">${paragraphs.join('')}</div>`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

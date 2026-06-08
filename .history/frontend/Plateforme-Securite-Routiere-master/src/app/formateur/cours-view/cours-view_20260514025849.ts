import { Component, signal, computed, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CoursService, CourseDetail } from '../../core/services/cours';
import { CourseContentService, CourseContent } from '../../core/services/course-content.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-cours-view',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './cours-view.html',
  styleUrl: './cours-view.css',
  encapsulation: ViewEncapsulation.None,
})
export class CoursView implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private coursService = inject(CoursService);
  private courseContentService = inject(CourseContentService);
  private translate = inject(TranslateService);
  private sanitizer = inject(DomSanitizer);

  course = signal<CourseDetail | null>(null);
  courseContent = signal<CourseContent | null>(null);
  loading = signal(true);
  error = signal('');
  currentLessonIndex = signal(0);

  totalLessons = computed(() => this.courseContent()?.lessons.length || 0);
  currentLesson = computed(() => this.courseContent()?.lessons[this.currentLessonIndex()] ?? null);
  currentLessonNumber = computed(() => (this.currentLessonIndex() + 1));
  canGoPrev = computed(() => this.currentLessonIndex() > 0);
  canGoNext = computed(() => this.currentLessonIndex() < Math.max(0, this.totalLessons() - 1));
  progressPercent = computed(() => {
    const total = this.totalLessons();
    if (!total) return 0;
    return Math.round(((this.currentLessonIndex() + 1) / total) * 100);
  });
  currentLessonHtml = computed<SafeHtml | null>(() => {
    const lesson = this.currentLesson();
    return lesson ? this.sanitizer.bypassSecurityTrustHtml(lesson.content) : null;
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set(this.translate.instant('FORMATEUR.COURS_VIEW.MESSAGES.MISSING_ID'));
      this.loading.set(false);
      return;
    }

    this.loadCourseContent(id);
  }

  private loadCourseContent(id: number): void {
    this.coursService.manageGet(id).subscribe({
      next: (course) => {
        this.course.set(course);
        this.courseContent.set(this.courseContentService.getCourseContent(id) || null);
        this.currentLessonIndex.set(0);
        this.loading.set(false);
      },
      error: (err) => {
        this.coursService.getPublished(id).subscribe({
          next: (course) => {
            this.course.set(course);
            this.courseContent.set(this.courseContentService.getCourseContent(id) || null);
            this.currentLessonIndex.set(0);
            this.loading.set(false);
          },
          error: (fallbackErr) => {
            console.error('❌ CoursView - Erreur fallback getPublished:', fallbackErr);
            this.error.set(this.translate.instant('FORMATEUR.COURS_VIEW.MESSAGES.LOAD_ERROR'));
            this.loading.set(false);
          }
        });
      }
    });
  }

  prevPage(): void {
    if (!this.canGoPrev()) return;
    this.currentLessonIndex.update(v => Math.max(0, v - 1));
  }

  nextPage(): void {
    if (!this.canGoNext()) return;
    const maxIndex = this.totalLessons() - 1;
    this.currentLessonIndex.update(v => Math.min(maxIndex, v + 1));
  }

  selectLesson(index: number): void {
    if (index < 0 || index >= this.totalLessons()) return;
    this.currentLessonIndex.set(index);
  }

  formatDuration(duration?: string | number | null): string {
    if (duration === null || duration === undefined || duration === '') {
      return '—';
    }
    return typeof duration === 'number' ? `${duration} min` : duration;
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
}

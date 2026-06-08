import { Component, computed, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CourseContent, CourseContentService } from '../../core/services/course-content.service';
import { CoursService, CourseDetail } from '../../core/services/cours';

@Component({
  selector: 'app-cours-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
  currentLessonHtml = computed<SafeHtml | null>(() => {
    const lesson = this.currentLesson();
    if (!lesson) {
      return null;
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
      error: () => {
        this.coursService.getPublished(id).subscribe({
          next: (course) => {
            this.course.set(course);
            this.courseContent.set(this.courseContentService.getCourseContent(id) || null);
            this.currentLessonIndex.set(0);
            this.loading.set(false);
          },
          error: () => {
            this.error.set('Impossible de charger le cours. Vérifiez que le cours existe et est publié.');
            this.loading.set(false);
          }
        });
      }
    });
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

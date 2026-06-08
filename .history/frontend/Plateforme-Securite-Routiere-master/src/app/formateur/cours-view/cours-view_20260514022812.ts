import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CoursService, CourseDetail } from '../../core/services/cours';

@Component({
  selector: 'app-cours-view',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './cours-view.html',
  styleUrl: './cours-view.css',
})
export class CoursView implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private coursService = inject(CoursService);
  private translate = inject(TranslateService);

  course = signal<CourseDetail | null>(null);
  loading = signal(true);
  error = signal('');

  private readonly maxCharsPerPage = 900;
  private currentPageIndex = signal(0);

  private splitIntoPages(content: string): string[] {
    const text = (content || '').trim();
    if (!text) return [''];

    const paragraphs = text
      .split(/\r?\n\s*\r?\n/g)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    if (paragraphs.length === 0) return [''];

    const pages: string[] = [];
    let buffer = '';
    for (const paragraph of paragraphs) {
      const candidate = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
      if (candidate.length <= this.maxCharsPerPage || !buffer) {
        buffer = candidate;
      } else {
        pages.push(buffer);
        buffer = paragraph;
      }
    }

    if (buffer) pages.push(buffer);
    return pages.length ? pages : [''];
  }

  pages = computed(() => this.splitIntoPages(this.course()?.content || ''));
  totalPages = computed(() => Math.max(1, this.pages().length));
  currentPageNumber = computed(() => {
    const total = this.totalPages();
    const clampedIndex = Math.min(Math.max(this.currentPageIndex(), 0), total - 1);
    return clampedIndex + 1;
  });

  displayedContent = computed(() => {
    const list = this.pages();
    const total = Math.max(1, list.length);
    const clampedIndex = Math.min(Math.max(this.currentPageIndex(), 0), total - 1);
    return list[clampedIndex] ?? '';
  });

  canGoPrev = computed(() => this.currentPageNumber() > 1);
  canGoNext = computed(() => this.currentPageNumber() < this.totalPages());

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
        this.currentPageIndex.set(0);
        this.loading.set(false);
      },
      error: (err) => {
        this.coursService.getPublished(id).subscribe({
          next: (course) => {
            this.course.set(course);
            this.currentPageIndex.set(0);
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
    this.currentPageIndex.update(v => Math.max(0, v - 1));
  }

  nextPage(): void {
    if (!this.canGoNext()) return;
    const maxIndex = this.totalPages() - 1;
    this.currentPageIndex.update(v => Math.min(maxIndex, v + 1));
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

import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CoursService, CourseDetail } from '../../core/services/cours';

interface CourseData {
  id: number;
  titre: string;
  description?: string;
  title?: string;
  category?: string;
  level?: string;
  duration?: string | number;
  image_url?: string;
  video_url?: string;
  content?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-cours-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cours-view.html',
  styleUrl: './cours-view.css',
})
export class CoursView implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private coursService = inject(CoursService);

  course = signal<CourseDetail | null>(null);
  loading = signal(true);
  error = signal('');

  private readonly maxCharsPerPage = 900;
  private currentPageIndex = signal(0);

  private splitIntoPages(content: string): string[] {
    const text = (content || '').trim();
    if (!text) return [''];

    // Split by blank lines (paragraphs), then group into pages by size.
    const paragraphs = text
      .split(/\r?\n\s*\r?\n/g)
      .map(p => p.trim())
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
      this.error.set('ID du cours manquant');
      this.loading.set(false);
      return;
    }

    console.log('📋 CoursView - Loading course ID:', id);
    this.loadCourseContent(id);
  }

  /**
   * Charge le contenu complet du cours depuis l'API
   */
  private loadCourseContent(id: number): void {
    console.log('🔄 CoursView - Appel API pour charger le cours...');
    
    // Toujours charger depuis l'API pour obtenir le vrai contenu
    this.coursService.manageGet(id).subscribe({
      next: (course) => {
        console.log('✅ CoursView - Cours chargé depuis manageGet:', course);
        this.course.set(course);
        this.currentPageIndex.set(0);
        this.loading.set(false);
      },
      error: (err) => {
        console.warn('⚠️ CoursView - Erreur manageGet, essai avec getPublished:', err);
        // Fallback sur l'endpoint public
        this.coursService.getPublished(id).subscribe({
          next: (course) => {
            console.log('✅ CoursView - Cours chargé depuis getPublished:', course);
            this.course.set(course);
            this.currentPageIndex.set(0);
            this.loading.set(false);
          },
          error: (fallbackErr) => {
            console.error('❌ CoursView - Erreur fallback getPublished:', fallbackErr);
            this.error.set('Impossible de charger le cours. Vérifiez que le cours existe et est publié.');
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

  /**
   * Retourner au dashboard du formateur
   */
  goBack(): void {
    this.router.navigate(['/formateur/cours']);
  }

  /**
   * Accéder au mode édition du cours
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

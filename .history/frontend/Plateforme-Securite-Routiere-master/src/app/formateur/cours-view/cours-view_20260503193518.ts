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
        this.loading.set(false);
      },
      error: (err) => {
        console.warn('⚠️ CoursView - Erreur manageGet, essai avec getPublished:', err);
        // Fallback sur l'endpoint public
        this.coursService.getPublished(id).subscribe({
          next: (course) => {
            console.log('✅ CoursView - Cours chargé depuis getPublished:', course);
            this.course.set(course);
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

  /**
   * Accéder aux statistiques du cours
   */
  viewStatistics(): void {
    const id = this.course()?.id;
    if (id) {
      this.router.navigate(['/formateur/cours', id, 'statistiques'], {
        state: { cours: this.course() }
      });
    }
  }
}

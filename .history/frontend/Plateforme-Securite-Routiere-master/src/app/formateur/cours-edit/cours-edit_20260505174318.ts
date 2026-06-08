import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CoursService, CourseDetail } from '../../core/services/cours';

@Component({
  selector: 'app-cours-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cours-edit.html',
  styleUrl: './cours-edit.css',
})
export class CoursEdit implements OnInit {
  course = signal<CourseDetail | null>(null);
  isLoading = signal(true);
  isSaving = signal(false);
  error = signal('');
  success = signal('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private coursService: CoursService
  ) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('ID du cours manquant');
      this.isLoading.set(false);
      return;
    }
    
    console.log('📋 CoursEdit ngOnInit - Chargement du cours ID:', id);
    
    // Charger les données depuis le backend uniquement
    this.coursService.manageGet(id)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
          console.log('✅ CoursEdit - Chargement terminé (finalize)');
        })
      )
      .subscribe({
        next: (c) => { 
          console.log('✅ CoursEdit - Backend data loaded:', c);
          console.log('  - Title:', c.title);
          console.log('  - Description:', c.description);
          console.log('  - Content:', c.content?.substring(0, 50) + '...');
          console.log('  - Category:', c.category);
          console.log('  - Level:', c.level);
          this.course.set(c);
        },
        error: (err) => {
          console.error('❌ CoursEdit - Erreur chargement backend manage:', err);
          console.error('  - Status:', err.status);
          console.error('  - Detail:', err.error?.detail);
          const errorMsg = err.error?.detail || 'Impossible de charger le cours: ' + err.statusText;
          this.error.set(errorMsg);
        }
      });
  }

  save() {
    const currentCourse = this.course();
    if (!currentCourse) {
      this.error.set('Aucun cours à sauvegarder');
      return;
    }
    
    this.isSaving.set(true);
    this.error.set('');
    this.success.set('');
    
    console.log('💾 Sauvegarde du cours:', {
      id: currentCourse.id,
      title: currentCourse.title,
      category: currentCourse.category,
      level: currentCourse.level,
    });

    this.coursService.update(currentCourse.id, {
      title: currentCourse.title,
      description: currentCourse.description || null,
      category: currentCourse.category,
      level: currentCourse.level,
      duration: currentCourse.duration || null,
      image_url: currentCourse.image_url || null,
      video_url: currentCourse.video_url || null,
      content: currentCourse.content || null,
      is_published: currentCourse.is_published,
    })
      .pipe(
        finalize(() => {
          this.isSaving.set(false);
          console.log('✅ Save operation completed (finalize) - loading state reset');
        })
      )
      .subscribe({
        next: (updatedCourse) => {
          console.log('✅ Cours sauvegardé avec succès:', updatedCourse);
          // ✅ Refetch fresh data from backend to ensure consistency
          const courseId = updatedCourse.id;
          console.log('🔄 Refetching course data from backend to ensure persistence...');
          
          this.coursService.manageGet(courseId).subscribe({
            next: (freshCourse) => {
              console.log('✅ Fresh data fetched from backend:', freshCourse);
              this.course.set(freshCourse);
              this.success.set('Cours mis à jour avec succès ✅');
              
              // Broadcast course update event
              window.dispatchEvent(new Event('courseUpdated'));
              
              // Rediriger vers la liste des cours après 3 secondes
              setTimeout(() => {
                this.router.navigate(['/formateur/cours']);
              }, 3000);
            },
            error: (refetchErr) => {
              console.warn('⚠️ Refetch failed, using response from update:', refetchErr);
              this.course.set(updatedCourse);
              this.success.set('Cours mis à jour avec succès ✅');
              window.dispatchEvent(new Event('courseUpdated'));
              // Rediriger vers la liste des cours après 3 secondes
              setTimeout(() => {
                this.router.navigate(['/formateur/cours']);
              }, 3000);
            }
          });
        },
        error: (err) => {
          console.error('❌ Erreur lors de la sauvegarde:', err);
          console.error('  - Status:', err.status);
          console.error('  - Error:', err.error);
          
          // Construire un message d'erreur détaillé
          let errorMessage = 'Erreur lors de la mise à jour';
          if (err.status === 403) {
            errorMessage = 'Accès refusé: Vous n\'avez pas la permission de modifier ce cours';
          } else if (err.status === 404) {
            errorMessage = 'Cours non trouvé';
          } else if (err.status === 401) {
            errorMessage = 'Session expirée. Veuillez vous reconnecter.';
          } else if (err.error?.detail) {
            errorMessage = err.error.detail;
          } else if (err.statusText) {
            errorMessage = `Erreur ${err.status}: ${err.statusText}`;
          }
          
          this.error.set(errorMessage);
          
          // Effacer le message d'erreur après 5 secondes
          setTimeout(() => this.error.set(''), 5000);
        }
      });
  }

  /**
   * Retour au dashboard formateur
   */
  goBack(): void {
    this.router.navigate(['/formateur/dashboard']);
  }

  /**
   * Voir le cours en mode lecture seule
   */
  viewCourse(): void {
    const currentCourse = this.course();
    if (currentCourse?.id) {
      this.router.navigate(['/formateur/cours', currentCourse.id, 'voir'], {
        state: { cours: currentCourse }
      });
    }
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { QcmService, QCMCreate, QuestionItem, AnswerItem, QCMCategory } from '../../core/services/qcm';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-qcm-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './qcm-create.html',
  styleUrl: './qcm-create.css',
})
export class QcmCreate implements OnInit {
  title = '';
  description = '';
  category = 'code_route';
  difficulty = 'moyen';
  duration_minutes = 15;
  pass_score = 70;

  questions: QuestionItem[] = [];
  categories: QCMCategory[] = [];
  saving = false;
  error = '';
  loading = false;

  qcmId: number | null = null;
  editMode = false;

  // ✅ NOUVEAU - Gestion images par question
  imagePreviews: { [qi: number]: string } = {};
  selectedFiles: { [qi: number]: File } = {};
  uploadingImage: { [qi: number]: boolean } = {};
  uploadSuccess: { [qi: number]: boolean } = {};
  backendUrl = environment.apiUrl;

  constructor(
    private qcmService: QcmService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.loadCategories();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.qcmId = parseInt(id, 10);
        this.editMode = true;
        this.loadQcm();
      } else {
        this.addQuestion();
      }
    });
  }

  loadCategories() {
    this.qcmService.listCategories().subscribe({
      next: (rows) => {
        this.categories = rows;
        this.ensureCategorySelection();
        this.cdr.markForCheck();
      },
      error: () => { }
    });
  }

  loadQcm() {
    if (!this.qcmId) return;
    this.loading = true;
    this.error = '';

    this.qcmService.adminGetQcm(this.qcmId).subscribe({
      next: (qcm) => {
        this.title = qcm.title;
        this.description = qcm.description || '';
        this.category = qcm.category;
        this.difficulty = qcm.difficulty;
        this.duration_minutes = qcm.duration_minutes;
        this.pass_score = qcm.pass_score;
        this.questions = qcm.questions || [];
        this.ensureCategorySelection();
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (e) => {
        this.error = e.error?.detail || this.translate.instant('ADMIN.QCM_CREATE.LOADING_ERROR');
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private ensureCategorySelection() {
    if (!this.categories.length) return;
    if (!this.category || !this.categories.some(c => c.slug === this.category)) {
      this.category = this.categories[0].slug;
    }
  }

  // ✅ NOUVEAU - Construire URL complète image
  getImageUrl(imageUrl: string | undefined | null): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${this.backendUrl}${imageUrl}`;
  }

  // ✅ NOUVEAU - Sélection fichier image
  onFileSelected(event: Event, qi: number) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.[0]) return;

    const file = input.files[0];
    this.selectedFiles[qi] = file;
    this.uploadSuccess[qi] = false;

    // Prévisualisation locale immédiate
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreviews[qi] = reader.result as string;
      this.cdr.markForCheck();
    };
    reader.readAsDataURL(file);

    // Si la question existe déjà en base (mode édition), uploader immédiatement
    const question = this.questions[qi];
    if (question.id) {
      this.uploadImageForQuestion(qi, question.id, file);
    }
  }

  // ✅ NOUVEAU - Upload image vers le backend
  private uploadImageForQuestion(qi: number, questionId: number, file: File) {
    this.uploadingImage[qi] = true;
    this.uploadSuccess[qi] = false;

    this.qcmService.uploadQuestionImage(questionId, file).subscribe({
      next: (res) => {
        this.questions[qi].image_url = res.image_url;
        this.uploadingImage[qi] = false;
        this.uploadSuccess[qi] = true;
        this.selectedFiles[qi] && delete this.selectedFiles[qi];
        this.cdr.markForCheck();

        // Effacer le message succès après 3 secondes
        setTimeout(() => {
          this.uploadSuccess[qi] = false;
          this.cdr.markForCheck();
        }, 3000);
      },
      error: () => {
        this.uploadingImage[qi] = false;
        this.error = `Erreur upload image question ${qi + 1}`;
        this.cdr.markForCheck();
      }
    });
  }

  // ✅ NOUVEAU - Supprimer image d'une question
  removeImage(qi: number) {
    const question = this.questions[qi];

    // Supprimer du backend si question existe
    if (question.id && question.image_url) {
      this.qcmService.deleteQuestionImage(question.id).subscribe({
        next: () => {
          question.image_url = undefined;
          this.cdr.markForCheck();
        },
        error: () => {
          this.error = `Erreur suppression image question ${qi + 1}`;
          this.cdr.markForCheck();
        }
      });
    }

    // Effacer prévisualisation locale
    delete this.imagePreviews[qi];
    delete this.selectedFiles[qi];
    question.image_url = undefined;
    this.cdr.markForCheck();
  }

  addQuestion() {
    this.questions.push({
      text: '',
      explanation: '',
      order: this.questions.length + 1,
      answers: [
        { text: '', is_correct: true },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
        { text: '', is_correct: false },
      ]
    });
  }

  removeQuestion(qi: number) {
    // Nettoyer les données image de la question supprimée
    delete this.imagePreviews[qi];
    delete this.selectedFiles[qi];
    delete this.uploadingImage[qi];
    delete this.uploadSuccess[qi];

    this.questions.splice(qi, 1);
    this.questions.forEach((q, i) => q.order = i + 1);
  }

  addAnswer(qi: number) {
    this.questions[qi].answers.push({ text: '', is_correct: false });
  }

  removeAnswer(qi: number, ai: number) {
    this.questions[qi].answers.splice(ai, 1);
  }

  setCorrect(qi: number, ai: number) {
    this.questions[qi].answers.forEach((a, i) => a.is_correct = (i === ai));
  }

  validate(): string | null {
    if (!this.title.trim()) return 'Le titre est requis';
    if (this.questions.length === 0) return 'Ajoutez au moins une question';
    for (let i = 0; i < this.questions.length; i++) {
      const q = this.questions[i];
      if (!q.text.trim()) return `Question ${i + 1} : le texte est vide`;
      if (q.answers.length < 2) return `Question ${i + 1} : au moins 2 réponses`;
      if (!q.answers.some(a => a.is_correct)) return `Question ${i + 1} : aucune bonne réponse`;
      if (q.answers.some(a => !a.text.trim())) return `Question ${i + 1} : réponse vide`;
    }
    return null;
  }

  save() {
    const err = this.validate();
    if (err) { this.error = this.translate.instant(err) ?? err; return; }

    this.saving = true;
    this.error = '';

    const payload: QCMCreate = {
      title: this.title,
      description: this.description,
      category: this.category,
      difficulty: this.difficulty,
      duration_minutes: this.duration_minutes,
      pass_score: this.pass_score,
      questions: this.questions,
    };

    const request = this.editMode && this.qcmId
      ? this.qcmService.updateQcm(this.qcmId, payload)
      : this.qcmService.createQcm(payload);

    request.subscribe({
      next: (savedQcm) => {
        // ✅ Uploader les images en attente (nouvelles questions sans ID avant sauvegarde)
        const uploadPromises = this.questions.map((q, qi) => {
          const file = this.selectedFiles[qi];
          const savedQuestion = savedQcm.questions?.[qi];
          if (file && savedQuestion?.id) {
            return new Promise<void>((resolve) => {
              this.qcmService.uploadQuestionImage(savedQuestion.id!, file).subscribe({
                next: () => resolve(),
                error: () => resolve()
              });
            });
          }
          return Promise.resolve();
        });

        Promise.all(uploadPromises).then(() => {
          this.router.navigate(['/admin/qcm']);
        });
      },
      error: (e) => {
        this.error = e.error?.detail || this.translate.instant(
          this.editMode ? 'ADMIN.QCM_CREATE.UPDATE_ERROR' : 'ADMIN.QCM_CREATE.CREATE_ERROR'
        );
        this.saving = false;
        this.cdr.markForCheck();
      }
    });
  }
}
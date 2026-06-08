import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { QcmService, QCMDetail, QuestionItem, AnswerItem, SubmitAnswer } from '../../core/services/qcm.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-qcm-session',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './qcm-session.component.html',
  styleUrls: ['./qcm-session.component.css']
})
export class QcmSessionComponent implements OnInit, OnDestroy {
  qcm: QCMDetail | null = null;
  currentIndex = 0;
  selectedAnswerId: number | null = null;
  answered = false;
  timeLeft = 0;
  private timer: any;

  loading = true;
  error = '';
  imageError = false;

  // Réponses
  userAnswers: SubmitAnswer[] = [];
  durationSeconds = 0;
  private startTime!: number;

  // Résultat
  result: any = null;
  showResult = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private qcmService: QcmService
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/apprenant/qcm']);
      return;
    }
    const qcmId = +idParam;
    const isGenerated = this.route.snapshot.queryParamMap.get('generated') === '1';

    this.startTime = Date.now();

    const fetch$ = isGenerated
      ? this.qcmService.getGeneratedQcmForTest(qcmId)
      : this.qcmService.getQcmForTest(qcmId);

    fetch$.subscribe({
      next: (qcm) => {
        this.qcm = qcm;
        this.loading = false;
        this.startTimer();
      },
      error: () => {
        this.error = 'Erreur lors du chargement du QCM.';
        this.loading = false;
      }
    });
  }

  // ═══ GETTERS ═══

  get currentQuestion(): QuestionItem | null {
    return this.qcm?.questions[this.currentIndex] ?? null;
  }

  /**
   * Construit l'URL complète de l'image.
   * Si c'est une URL locale (/static/...), préfixe avec l'URL du backend.
   * Si c'est déjà une URL Internet (http...), laisse telle quelle.
   */
  get currentQuestionImageUrl(): string | null {
    if (!this.currentQuestion?.image_url) return null;
    const url = this.currentQuestion.image_url;

    // URL complète déjà (Wikimedia, imgur, etc.)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // URL locale servie par FastAPI (/static/question_images/...)
    if (url.startsWith('/static/')) {
      return `${environment.apiUrl}${url}`;
    }

    return url;
  }

  get hasImage(): boolean {
    return !!this.currentQuestionImageUrl && !this.imageError;
  }

  get isLastQuestion(): boolean {
    if (!this.qcm) return false;
    return this.currentIndex === this.qcm.questions.length - 1;
  }

  get progressPercent(): number {
    if (!this.qcm || this.qcm.questions.length === 0) return 0;
    return ((this.currentIndex + 1) / this.qcm.questions.length) * 100;
  }

  // ═══ IMAGE HANDLERS ═══

  onImageError() {
    this.imageError = true;
  }

  onImageLoad() {
    this.imageError = false;
  }

  // ═══ TIMER ═══

  private startTimer() {
    if (!this.qcm) return;
    const secondsPerQuestion = (this.qcm.duration_minutes * 60) / this.qcm.questions.length;
    this.timeLeft = Math.round(secondsPerQuestion);
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.answered = true;
      }
    }, 1000);
  }

  // ═══ RÉPONSES ═══

  selectAnswer(answer: AnswerItem) {
    if (this.answered) return;
    this.selectedAnswerId = answer.id ?? null;
    this.answered = true;
    clearInterval(this.timer);

    if (this.currentQuestion && this.selectedAnswerId !== null) {
      this.userAnswers.push({
        question_id: this.currentQuestion.id!,
        answer_id: this.selectedAnswerId
      });
    }
  }

  isCorrectAnswer(answer: AnswerItem): boolean {
    return answer.is_correct === true;
  }

  isWrongSelected(answer: AnswerItem): boolean {
    return this.answered &&
           this.selectedAnswerId === answer.id &&
           !answer.is_correct;
  }

  isCorrectSelected(answer: AnswerItem): boolean {
    return this.answered &&
           this.selectedAnswerId === answer.id &&
           answer.is_correct;
  }

  // ═══ NAVIGATION ═══

  nextQuestion() {
    if (!this.qcm) return;
    this.imageError = false;
    this.selectedAnswerId = null;
    this.answered = false;

    if (this.currentIndex < this.qcm.questions.length - 1) {
      this.currentIndex++;
      this.startTimer();
    }
  }

  finishQcm() {
    if (!this.qcm) return;
    clearInterval(this.timer);
    this.durationSeconds = Math.round((Date.now() - this.startTime) / 1000);

    const isGenerated = this.route.snapshot.queryParamMap.get('generated') === '1';
    const submit$ = isGenerated
      ? this.qcmService.submitGeneratedQcm(this.qcm.id, this.userAnswers, this.durationSeconds)
      : this.qcmService.submitQcm(this.qcm.id, this.userAnswers, this.durationSeconds);

    submit$.subscribe({
      next: (res) => {
        this.result = res;
        this.showResult = true;
      },
      error: () => {
        this.error = 'Erreur lors de la soumission.';
      }
    });
  }

  goToQcmList() {
    this.router.navigate(['/apprenant/qcm']);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }
}
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { QcmService, QCMDetail, QuestionItem, AnswerItem } from '../../core/services/qcm.service';

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

  // Pour stocker les réponses de l'utilisateur
  userAnswers: { questionId: number; answerId: number }[] = [];

  // Résultat final
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

    const fetch$ = isGenerated
      ? this.qcmService.getGeneratedQcmForTest(qcmId)
      : this.qcmService.getQcmForTest(qcmId);

    fetch$.subscribe({
      next: (qcm) => {
        this.qcm = qcm;
        this.loading = false;
        this.startTimer();
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement du QCM.';
        this.loading = false;
      }
    });
  }

  // ─── Getters ───

  get currentQuestion(): QuestionItem | null {
    return this.qcm?.questions[this.currentIndex] ?? null;
  }

  get hasImage(): boolean {
    return !!this.currentQuestion?.image_url && !this.imageError;
  }

  get isLastQuestion(): boolean {
    if (!this.qcm) return false;
    return this.currentIndex === this.qcm.questions.length - 1;
  }

  get progressPercent(): number {
    if (!this.qcm || this.qcm.questions.length === 0) return 0;
    return ((this.currentIndex + 1) / this.qcm.questions.length) * 100;
  }

  // ─── Image ───

  onImageError() {
    this.imageError = true;
  }

  onImageLoad() {
    this.imageError = false;
  }

  // ─── Timer ───

  private startTimer() {
    if (!this.qcm) return;
    const secondsPerQuestion = (this.qcm.duration_minutes * 60) / this.qcm.questions.length;
    this.timeLeft = Math.round(secondsPerQuestion);
    this.timer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.answered = true; // Temps écoulé
      }
    }, 1000);
  }

  // ─── Réponses ───

  selectAnswer(answer: AnswerItem) {
    if (this.answered) return;
    this.selectedAnswerId = answer.id ?? null;
    this.answered = true;
    clearInterval(this.timer);

    if (this.currentQuestion && this.selectedAnswerId !== null) {
      this.userAnswers.push({
        questionId: this.currentQuestion.id!,
        answerId: this.selectedAnswerId
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

  // ─── Navigation ───

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

    const isGenerated = this.route.snapshot.queryParamMap.get('generated') === '1';
    const submit$ = isGenerated
      ? this.qcmService.submitGeneratedQcm(this.qcm.id, this.userAnswers)
      : this.qcmService.submitQcm(this.qcm.id, this.userAnswers);

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
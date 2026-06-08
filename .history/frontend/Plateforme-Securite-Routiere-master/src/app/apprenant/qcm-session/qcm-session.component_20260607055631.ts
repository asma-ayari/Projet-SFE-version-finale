import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { QcmService, QCMDetail, QuestionItem, AnswerItem, SubmitAnswer } from '../../core/services/qcm';

@Component({
  selector: 'app-qcm-session',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
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

  userAnswers: SubmitAnswer[] = [];
  durationSeconds = 0;
  private startTime!: number;

  result: any = null;
  showResult = false;

  readonly answerLetters = ['A', 'B', 'C', 'D'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private qcmService: QcmService,
    public translate: TranslateService
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
        this.error = this.translate.instant('QCM_PANEL.TEST.LOAD_ERROR');
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
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.answered = true;
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
        this.error = this.translate.instant('QCM_PANEL.TEST.SUBMIT_ERROR');
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
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { QcmService, QCMDetail, QuestionItem, AnswerItem, SubmitAnswer } from '../../core/services/qcm';
import { LanguageService } from '../../core/services/language.service';
import { catchError, Subscription, throwError } from 'rxjs';

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

  get normalizedResultDetails(): Array<{
    is_correct: boolean;
    question_text: string;
    user_answer_text: string;
    correct_answer_text: string;
    explanation: string;
  }> {
    if (!this.result?.details || !this.qcm) return [];
    return this.result.details.map((d: any) => {
      const question = this.qcm!.questions.find(q => q.id === d.question_id);
      if (!question) {
        return {
          is_correct: d.is_correct ?? false,
          question_text: d.question_text || `Question ${d.question_id}`,
          user_answer_text: d.user_answer_text || d.selected_answer_text || this.translate.instant('QCM_PANEL.RESULT.NO_ANSWER'),
          correct_answer_text: d.correct_answer_text || this.translate.instant('QCM_PANEL.RESULT.UNKNOWN'),
          explanation: d.explanation || '',
        };
      }
      const selectedAnswer = question.answers.find(a => a.id === d.answer_id);
      const correctAnswer = question.answers.find(a => a.id === d.correct_answer_id) || question.answers.find(a => a.is_correct);
      return {
        is_correct: d.is_correct ?? false,
        question_text: question.text || '',
        user_answer_text: selectedAnswer?.text || this.translate.instant('QCM_PANEL.RESULT.NO_ANSWER'),
        correct_answer_text: correctAnswer?.text || this.translate.instant('QCM_PANEL.RESULT.UNKNOWN'),
        explanation: question.explanation || '',
      };
    });
  }

  readonly answerLetters = ['A', 'B', 'C', 'D'];
  isGenerated = false;   // public for template
  private qcmId = 0;
  private langSub?: Subscription;
  private paramSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private qcmService: QcmService,
    public translate: TranslateService,
    private languageService: LanguageService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.paramSub = this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (!idParam) {
        this.router.navigate(['/apprenant/qcm']);
        return;
      }
      const newId = +idParam;
      const newIsGenerated = this.route.snapshot.queryParamMap.get('generated') === '1';
      if (newId !== this.qcmId || newIsGenerated !== this.isGenerated) {
        this.qcmId = newId;
        this.isGenerated = newIsGenerated;
        this.qcm = null;
        this.userAnswers = [];
        this.currentIndex = 0;
        this.selectedAnswerId = null;
        this.answered = false;
        this.result = null;
        this.showResult = false;
        clearInterval(this.timer);
        this.startTime = Date.now();
        this.loadQcm();
      }
    });
    this.langSub = this.translate.onLangChange.subscribe(() => {
      this.loadQcm(true);
    });
  }

  private loadQcm(keepSession = false) {
    if (!keepSession || this.isGenerated) {
      this.loading = true;
      this.error = '';
    }
    // QCM générés : pas de lang → backend retourne la langue d'origine (sans traduction)
    // QCM officiels : on passe la langue UI pour la traduction
    const fetch$ = this.isGenerated
      ? this.qcmService.getGeneratedQcmForTest(this.qcmId).pipe(
        catchError((err) => {
          if (err?.name === 'TimeoutError') {
            return throwError(() => err);
          }
          return this.qcmService.getGeneratedQcmForTest(this.qcmId);
        }),
      )
      : this.qcmService.getQcmForTest(this.qcmId);

    fetch$.subscribe({
      next: (qcm) => {
        this.qcm = qcm;
        this.loading = false;
        if (!keepSession) {
          this.startTimer();
        }
        // Forcer la détection de changement : le callback HTTP ne déclenche
        // pas toujours le cycle de détection Angular, ce qui laisse le spinner
        // visible et le QCM invisible jusqu'au prochain événement utilisateur.
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = this.translate.instant('QCM_PANEL.TEST.LOAD_ERROR');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    clearInterval(this.timer);
    this.langSub?.unsubscribe();
    this.paramSub?.unsubscribe();
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
    const durationMinutes = this.qcm.duration_minutes || 0;
    const questionCount = this.qcm.questions.length || 1;
    // If no duration configured (0), use 30s per question as default
    const totalSeconds = durationMinutes > 0
      ? durationMinutes * 60
      : questionCount * 30;
    const secondsPerQuestion = totalSeconds / questionCount;
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

  isQuizPassed(result: { score: number } | null): boolean {
    if (!result) return false;
    return result.score >= 50;
  }

  goToQcmList() {
    this.router.navigate(['/apprenant/qcm']);
  }
}
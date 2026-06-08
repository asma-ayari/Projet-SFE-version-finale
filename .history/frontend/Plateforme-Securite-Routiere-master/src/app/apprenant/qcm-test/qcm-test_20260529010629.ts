import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { QcmService, QCMDetail, SubmitAnswer } from '../../core/services/qcm';
import { ChatbotWidgetComponent } from '../../shared/chatbot-widget/chatbot-widget';
import { finalize, timeout } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-qcm-test',
  standalone: true,
  imports: [CommonModule, ChatbotWidgetComponent, TranslateModule],
  templateUrl: './qcm-test.html',
  styleUrl: './qcm-test.css',
})
export class QcmTest implements OnInit, OnDestroy {
  qcm: QCMDetail | null = null;
  loading = true;
  error = '';
  submitting = false;
  isGenerated = false;

  currentIndex = 0;
  selectedAnswers: Map<number, number> = new Map();

  // ✅ URL backend pour les images
  backendUrl = environment.apiUrl;

  // Timer
  timeLeft = 0;
  timerInterval: any;
  startTime = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private qcmService: QcmService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.isGenerated = this.route.snapshot.queryParamMap.get('generated') === '1';
    const source$ = this.isGenerated
      ? this.qcmService.getGeneratedQcmForTest(id)
      : this.qcmService.getQcmForTest(id);

    source$
      .pipe(
        timeout(8000),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (qcm) => {
          this.qcm = qcm;
          this.timeLeft = (qcm.duration_minutes || 15) * 60;
          this.startTime = Date.now();
          this.startTimer();
          this.cdr.detectChanges();
        },
        error: (err) => {
          if (err?.name === 'TimeoutError') {
            this.error = 'Temps de réponse dépassé. Vérifiez le serveur.';
          } else {
            this.error = err.error?.detail || 'QCM non trouvé';
          }
          this.cdr.detectChanges();
        }
      });
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.submit();
      }
    }, 1000);
  }

  get timerDisplay(): string {
    const m = Math.floor(this.timeLeft / 60);
    const s = this.timeLeft % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  get timerClass(): string {
    if (this.timeLeft < 60) return 'text-danger fw-bold';
    if (this.timeLeft < 180) return 'text-warning';
    return '';
  }

  get currentQuestion() {
    return this.qcm?.questions?.[this.currentIndex] || null;
  }

  get progress(): number {
    if (!this.qcm) return 0;
    return Math.round(((this.currentIndex + 1) / this.qcm.questions.length) * 100);
  }

  get answeredCount(): number {
    return this.selectedAnswers.size;
  }

  // ✅ Construire l'URL complète de l'image
  getImageUrl(imageUrl: string | undefined): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${this.backendUrl}${imageUrl}`;
  }

  selectAnswer(questionId: number, answerId: number) {
    this.selectedAnswers.set(questionId, answerId);
  }

  isSelected(questionId: number, answerId: number): boolean {
    return this.selectedAnswers.get(questionId) === answerId;
  }

  goTo(index: number) {
    this.currentIndex = index;
  }

  prev() {
    if (this.currentIndex > 0) this.currentIndex--;
  }

  next() {
    if (this.qcm && this.currentIndex < this.qcm.questions.length - 1) {
      this.currentIndex++;
    }
  }

  isAnswered(qi: number): boolean {
    const q = this.qcm?.questions[qi];
    return q ? this.selectedAnswers.has(q.id!) : false;
  }

  submit() {
    if (!this.qcm) return;
    clearInterval(this.timerInterval);
    this.submitting = true;

    const duration = Math.round((Date.now() - this.startTime) / 1000);
    const answers: SubmitAnswer[] = [];
    for (const q of this.qcm.questions) {
      const aid = this.selectedAnswers.get(q.id!);
      if (aid !== undefined) {
        answers.push({ question_id: q.id!, answer_id: aid });
      }
    }

    const submit$ = this.isGenerated
      ? this.qcmService.submitGeneratedQcm(this.qcm.id, answers, duration)
      : this.qcmService.submitQcm(this.qcm.id, answers, duration);

    submit$.subscribe({
      next: (result) => {
        this.router.navigate(['/apprenant/qcm', this.qcm!.id, 'resultat'], {
          state: { result }
        });
      },
      error: (err) => {
        this.error = err.error?.detail || 'Erreur lors de la soumission';
        this.submitting = false;
      }
    });
  }
}
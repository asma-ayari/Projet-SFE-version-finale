import { Component, signal, ElementRef, ViewChild, AfterViewChecked, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ChatbotService, ChatResponse, SignInfo, SourceInfo } from '../../core/services/chatbot.service';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable, of, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

interface Message {
  id: number;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
  signs?: SignInfo[];
  sources?: SourceInfo[];
  contextFound?: boolean;
  feedbackGiven?: 'positive' | 'negative' | null;
  feedbackComment?: string;
  feedbackSubmitted?: boolean;
  feedbackSubmitting?: boolean;
  feedbackError?: string;
  imageUrl?: string;
}

interface SuggestedQuestion {
  text: string;
  icon: string;
}

@Component({
  selector: 'app-chatbot',
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css',
})
export class Chatbot implements AfterViewChecked {
  private chatbotService = inject(ChatbotService);
  private authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);
  private translationSub?: Subscription;

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('imageInput') private imageInput!: ElementRef<HTMLInputElement>;

  userMessage = '';
  isLoading = signal(false);
  isRecording = signal(false);
  isSpeaking = signal(false);
  messageIdCounter = 0;
  currentConversationId: number | null = null;
  private sessionId = 'session_' + Date.now();
  private recognition: any = null;
  private synthesis = window.speechSynthesis;

  // Conversation history sidebar
  conversations = signal<any[]>([]);
  showConversations = signal(false);

  messages = signal<Message[]>([]);

  suggestedQuestions: SuggestedQuestion[] = [
    { text: 'Quelles sont les règles de priorité à un carrefour ?', icon: 'fas fa-traffic-light' },
    { text: 'Comment réagir en cas d\'accident ?', icon: 'fas fa-car-crash' },
    { text: 'Quelle est la limite de vitesse en ville ?', icon: 'fas fa-tachometer-alt' },
    { text: 'Expliquez les panneaux d\'interdiction', icon: 'fas fa-ban' }
  ];

  constructor(
    private languageService: LanguageService,
    private translate: TranslateService,
  ) {
    this.applyLocalizedText();
    this.loadConversations();
    this.initSpeechRecognition();
    this.translationSub = this.translate.onLangChange.subscribe(() => {
      this.applyLocalizedText();
      this.updateSpeechLanguage();
    });
  }

  ngOnDestroy(): void {
    this.translationSub?.unsubscribe();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  getNextId(): number {
    return ++this.messageIdCounter;
  }

  private applyLocalizedText(): void {
    const isArabic = this.languageService.getCurrentLang() === 'ar';
    const fallbackWelcome = isArabic
      ? 'مرحباً! 👋 أنا مساعدك الذكي المتخصص في السلامة المرورية في تونس. اسألني أي سؤال عن قانون المرور، أو أرسل صورة علامة للتعرف عليها، أو استخدم الميكروفون للتحدث!'
      : 'Bonjour ! 👋 Je suis votre assistant intelligent spécialisé en sécurité routière en Tunisie. Posez-moi n\'importe quelle question sur le code de la route, envoyez une image de panneau pour l\'identifier, ou utilisez le micro pour parler !';

    this.translate.get([
      'CHATBOT.WELCOME',
      'CHATBOT.Q_SIGNS',
      'CHATBOT.Q_PRIORITY',
      'CHATBOT.Q_FIRST_AID',
      'CHATBOT.Q_SPEED',
    ]).subscribe((translations) => {
      const welcome = translations['CHATBOT.WELCOME'] || fallbackWelcome;
      const suggestedQuestions = isArabic
        ? [
            { text: translations['CHATBOT.Q_SIGNS'] || 'إشارات المرور', icon: 'fas fa-traffic-light' },
            { text: translations['CHATBOT.Q_PRIORITY'] || 'قواعد الأولوية', icon: 'fas fa-car-crash' },
            { text: translations['CHATBOT.Q_FIRST_AID'] || 'الإسعافات الأولية', icon: 'fas fa-tachometer-alt' },
            { text: translations['CHATBOT.Q_SPEED'] || 'حدود السرعة', icon: 'fas fa-ban' },
          ]
        : [
            { text: 'Quelles sont les règles de priorité à un carrefour ?', icon: 'fas fa-traffic-light' },
            { text: "Comment réagir en cas d'accident ?", icon: 'fas fa-car-crash' },
            { text: 'Quelle est la limite de vitesse en ville ?', icon: 'fas fa-tachometer-alt' },
            { text: 'Expliquez les panneaux d\'interdiction', icon: 'fas fa-ban' },
          ];

      this.messages.set([{ id: this.getNextId(), content: welcome, sender: 'bot', timestamp: new Date() }]);
      this.suggestedQuestions = suggestedQuestions;
    });
  }

  private updateSpeechLanguage(): void {
    const lang = this.languageService.getCurrentLang();
    if (this.recognition) {
      this.recognition.lang = lang === 'ar' ? 'ar-SA' : 'fr-FR';
    }
  }

  scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch (err) { }
  }

  private ensureConversationId(): Observable<number | null> {
    if (this.currentConversationId) {
      return of(this.currentConversationId);
    }
    if (!this.authService.isAuthenticated()) {
      return of(null);
    }
    return this.chatbotService
      .createConversation('Conversation - ' + new Date().toLocaleDateString())
      .pipe(map((conv) => {
        this.currentConversationId = conv.id;
        return conv.id;
      }));
  }

  loadConversations(): void {
    if (this.authService.isAuthenticated()) {
      this.chatbotService.getConversations().subscribe({
        next: (convs) => { this.conversations.set(convs); },
        error: () => { }
      });
    }
  }

  loadConversation(conversationId: number): void {
    this.currentConversationId = conversationId;
    this.chatbotService.getMessages(conversationId).subscribe({
      next: (msgs) => {
        const mappedMsgs: Message[] = msgs.map(m => {
          const sender = m.role === 'user' ? 'user' as const : 'bot' as const;
          return {
            id: this.getNextId(),
            content: m.content,
            sender,
            timestamp: new Date(m.created_at),
            feedbackGiven: sender === 'bot' ? null : undefined,
            feedbackSubmitted: sender === 'bot' ? false : undefined,
            feedbackSubmitting: sender === 'bot' ? false : undefined,
            feedbackComment: sender === 'bot' ? '' : undefined,
            feedbackError: undefined,
          };
        });
        if (mappedMsgs.length > 0) {
          this.messages.set(mappedMsgs);
        }
        this.showConversations.set(false);
      },
      error: () => { }
    });
  }

  newConversation(): void {
    this.currentConversationId = null;
    this.messages.set([{
      id: this.getNextId(),
      content: 'Nouvelle conversation créée. Comment puis-je vous aider ?',
      sender: 'bot',
      timestamp: new Date()
    }]);
    this.showConversations.set(false);
  }

  sendMessage(): void {
    if (!this.userMessage.trim() || this.isLoading()) return;

    const userMsg: Message = {
      id: this.getNextId(),
      content: this.userMessage,
      sender: 'user',
      timestamp: new Date()
    };

    this.messages.update(msgs => [...msgs, userMsg]);
    const question = this.userMessage;
    this.userMessage = '';
    this.isLoading.set(true);

    this.ensureConversationId()
      .pipe(
        switchMap((conversationId) => this.chatbotService.askQuestion(
          { question },
          conversationId || undefined
        ))
      )
      .subscribe({
        next: (response: ChatResponse) => {
          const botMsg: Message = {
            id: this.getNextId(),
            content: response.answer,
            sender: 'bot',
            timestamp: new Date(),
            signs: response.signs || [],
            sources: response.sources || [],
            contextFound: response.context_found,
            feedbackGiven: null,
            feedbackComment: '',
            feedbackSubmitted: false,
            feedbackSubmitting: false,
            feedbackError: undefined,
          };
          this.messages.update(msgs => [...msgs, botMsg]);
          this.isLoading.set(false);
        },
        error: (err) => {
          const errorMsg: Message = {
            id: this.getNextId(),
            content: `❌ ${err.message || 'Erreur de connexion au serveur. Vérifiez que le backend est démarré.'}`,
            sender: 'bot',
            timestamp: new Date()
          };
          this.messages.update(msgs => [...msgs, errorMsg]);
          this.isLoading.set(false);
        }
      });
  }

  // ===== Image Upload & Detection =====

  triggerImageUpload(): void {
    this.imageInput?.nativeElement?.click();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || this.isLoading()) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) return;

    const imageUrl = URL.createObjectURL(file);
    const userMsg: Message = {
      id: this.getNextId(),
      content: '📷 Image envoyée pour détection de panneau',
      sender: 'user',
      timestamp: new Date(),
      imageUrl
    };
    this.messages.update(msgs => [...msgs, userMsg]);
    this.isLoading.set(true);

    this.ensureConversationId()
      .pipe(
        switchMap((conversationId) => this.chatbotService.detectSign(file, 'fr', conversationId || undefined))
      )
      .subscribe({
        next: (result) => {
          let content = '';
          if (result.success === false || result.error) {
            content = `❌ ${result.error || 'Erreur lors de la détection du panneau.'}`;
          } else {
            content = (result.description || '').trim() || 'Résultat indisponible.';
            if (result.signs?.length) {
              content += '\n\nPanneaux détectés :\n';
              result.signs.forEach((sign) => {
                const name = sign.name_fr || sign.name || sign.name_ar || 'Panneau';
                const label = sign.category_label || sign.category;
                const emoji = sign.category_emoji ? `${sign.category_emoji} ` : '';
                content += `• ${emoji}${label ? `${name} (${label})` : name}\n`;
              });
            }
          }
          const botMsg: Message = {
            id: this.getNextId(),
            content,
            sender: 'bot',
            timestamp: new Date(),
            feedbackGiven: null,
          };
          this.messages.update(msgs => [...msgs, botMsg]);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.messages.update(msgs => [...msgs, {
            id: this.getNextId(),
            content: `❌ ${err.message || 'Erreur lors de la détection du panneau.'}`,
            sender: 'bot',
            timestamp: new Date()
          }]);
          this.isLoading.set(false);
        }
      });

    input.value = '';
  }

  // ===== Speech-to-Text (STT) =====

  private initSpeechRecognition(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    this.recognition = new SpeechRecognition();
    this.updateSpeechLanguage();
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.userMessage = transcript;
      this.isRecording.set(false);
      this.sendMessage();
    };

    this.recognition.onerror = () => {
      this.isRecording.set(false);
    };

    this.recognition.onend = () => {
      this.isRecording.set(false);
    };
  }

  toggleRecording(): void {
    if (!this.recognition) {
      alert('La reconnaissance vocale n\'est pas supportée par votre navigateur.');
      return;
    }
    if (this.isRecording()) {
      this.recognition.stop();
      this.isRecording.set(false);
    } else {
      this.recognition.start();
      this.isRecording.set(true);
    }
  }

  // ===== Text-to-Speech (TTS) =====

  speakMessage(text: string): void {
    if (this.isSpeaking()) {
      this.synthesis.cancel();
      this.isSpeaking.set(false);
      return;
    }
    const cleanText = text.replace(/[*#📷🚦📋📂🎯📜❌👋•]/g, '').replace(/\n+/g, '. ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = this.languageService.getCurrentLang() === 'ar' ? 'ar-SA' : 'fr-FR';
    utterance.rate = 0.9;
    utterance.onend = () => this.isSpeaking.set(false);
    utterance.onerror = () => this.isSpeaking.set(false);
    this.isSpeaking.set(true);
    this.synthesis.speak(utterance);
  }

  selectQuestion(question: string): void {
    this.userMessage = question;
    this.sendMessage();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  giveFeedback(message: Message, isPositive: boolean): void {
    if (message.feedbackGiven) return;
    const feedbackGiven = isPositive ? 'positive' : 'negative';
    this.updateMessage(message.id, {
      feedbackGiven,
      feedbackError: undefined,
      feedbackSubmitted: isPositive ? true : false,
      feedbackSubmitting: false,
      feedbackComment: message.feedbackComment || '',
    });

    if (isPositive) {
      const userQuestion = this.getUserQuestionFor(message);
      this.chatbotService.submitFeedback({
        session_id: this.sessionId,
        question: userQuestion,
        answer: message.content,
        language: 'fr',
        is_positive: true,
      }).subscribe({
        error: () => {
          this.updateMessage(message.id, {
            feedbackSubmitted: false,
            feedbackError: 'Erreur lors de l\'envoi du feedback.'
          });
        }
      });
    }
  }

  submitNegativeFeedback(message: Message): void {
    if (message.feedbackGiven !== 'negative' || message.feedbackSubmitted) return;
    const userQuestion = this.getUserQuestionFor(message);
    this.updateMessage(message.id, { feedbackError: undefined, feedbackSubmitting: true });
    this.chatbotService.submitFeedback({
      session_id: this.sessionId,
      question: userQuestion,
      answer: message.content,
      language: 'fr',
      is_positive: false,
      comment: message.feedbackComment || undefined,
    }).subscribe({
      next: () => {
        this.updateMessage(message.id, {
          feedbackSubmitted: true,
          feedbackSubmitting: false,
        });
      },
      error: () => {
        this.updateMessage(message.id, {
          feedbackSubmitted: false,
          feedbackSubmitting: false,
          feedbackError: 'Erreur lors de l\'envoi du feedback.'
        });
      }
    });
  }

  private getUserQuestionFor(message: Message): string {
    const allMsgs = this.messages();
    const idx = allMsgs.findIndex(m => m.id === message.id);
    return idx > 0 ? allMsgs[idx - 1].content : '';
  }

  private updateMessage(id: number, patch: Partial<Message>): void {
    this.messages.update(msgs =>
      msgs.map(msg => msg.id === id ? { ...msg, ...patch } : msg)
    );
  }

  sanitizeSvg(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  toggleConversations(): void {
    this.showConversations.update(v => !v);
    if (this.showConversations()) {
      this.loadConversations();
    }
  }

  deleteConversation(id: number, event: Event): void {
    event.stopPropagation();
    this.chatbotService.deleteConversation(id).subscribe({
      next: () => {
        this.conversations.update(convs => convs.filter(c => c.id !== id));
        if (this.currentConversationId === id) {
          this.newConversation();
        }
      },
      error: () => { }
    });
  }
}

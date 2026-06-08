import { Component, signal, computed, ElementRef, ViewChild, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatResponse, SignInfo } from '../../core/services/chatbot.service';
import { AuthService } from '../../core/services/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Message {
  id: number;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
  signs?: SignInfo[];
  feedbackGiven?: 'positive' | 'negative' | null;
}

interface QuickAction {
  label: string;
  query: string;
  icon: string;
}

@Component({
  selector: 'app-chatbot',
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.css',
})
export class Chatbot implements AfterViewChecked {
  private chatbotService = inject(ChatbotService);
  private authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  currentMessage = '';
  isTyping = signal(false);
  currentLang = signal<'fr' | 'ar'>('fr');
  currentConversationId: number | null = null;

  messages = signal<Message[]>([
    {
      id: 1,
      content: 'Bonjour ! 👋 Je suis votre assistant virtuel spécialisé en sécurité routière en Tunisie. Posez-moi vos questions sur le code de la route, les panneaux, les règles de conduite... Comment puis-je vous aider ?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);

  quickActions: QuickAction[] = [
    { label: 'Panneaux de signalisation', query: 'Expliquez-moi les différents panneaux de signalisation en Tunisie', icon: '🚦' },
    { label: 'Règles de priorité', query: 'Quelles sont les règles de priorité à respecter en Tunisie ?', icon: '⚠️' },
    { label: 'Premiers secours', query: 'Que faire en cas d\'accident de la route ?', icon: '🏥' },
    { label: 'Limitations de vitesse', query: 'Quelles sont les limitations de vitesse en Tunisie ?', icon: '🚗' }
  ];

  suggestedQuestions = [
    'Comment obtenir mon permis de conduire en Tunisie ?',
    'Quels sont les documents obligatoires en voiture ?',
    'Comment fonctionne le système de points ?',
    'Que signifie un panneau rouge triangulaire ?'
  ];

  // Session ID for feedback
  private sessionId = 'session_' + Date.now();

  constructor() {
    // Create a conversation if user is authenticated
    if (this.authService.isAuthenticated()) {
      this.chatbotService.createConversation('Chatbot - ' + new Date().toLocaleDateString()).subscribe({
        next: (conv) => {
          this.currentConversationId = conv.id;
        },
        error: () => { } // Silently fail — will work without conversation tracking
      });
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  sendMessage() {
    if (!this.currentMessage.trim() || this.isTyping()) return;

    const userMessage: Message = {
      id: Date.now(),
      content: this.currentMessage,
      sender: 'user',
      timestamp: new Date()
    };

    this.messages.update(msgs => [...msgs, userMessage]);
    const question = this.currentMessage;
    this.currentMessage = '';

    // Show typing indicator
    this.isTyping.set(true);

    // Call the real backend RAG API
    const lang = this.currentLang() || undefined;
    this.chatbotService
      .askQuestion(
        { question, language: lang },
        this.currentConversationId || undefined
      )
      .subscribe({
        next: (response: ChatResponse) => {
          this.isTyping.set(false);
          const botMessage: Message = {
            id: Date.now(),
            content: response.answer,
            sender: 'bot',
            timestamp: new Date(),
            signs: response.signs || [],
            feedbackGiven: null,
          };
          this.messages.update(msgs => [...msgs, botMessage]);
        },
        error: (err) => {
          this.isTyping.set(false);
          const errorMessage: Message = {
            id: Date.now(),
            content: `❌ ${err.message || 'Erreur de connexion au serveur. Vérifiez que le backend est démarré.'}`,
            sender: 'bot',
            timestamp: new Date()
          };
          this.messages.update(msgs => [...msgs, errorMessage]);
        }
      });
  }

  sendQuickAction(action: QuickAction) {
    this.currentMessage = action.query;
    this.sendMessage();
  }

  sendSuggestion(question: string) {
    this.currentMessage = question;
    this.sendMessage();
  }

  toggleLanguage() {
    this.currentLang.update(lang => lang === 'fr' ? 'ar' : 'fr');
  }

  clearChat() {
    this.messages.set([{
      id: Date.now(),
      content: 'Chat effacé. Comment puis-je vous aider ?',
      sender: 'bot',
      timestamp: new Date()
    }]);
    // Create a new conversation
    if (this.authService.isAuthenticated()) {
      this.chatbotService.createConversation('Chatbot - ' + new Date().toLocaleDateString()).subscribe({
        next: (conv) => { this.currentConversationId = conv.id; },
        error: () => { }
      });
    }
  }

  giveFeedback(message: Message, isPositive: boolean) {
    if (message.feedbackGiven) return; // Already given

    message.feedbackGiven = isPositive ? 'positive' : 'negative';

    // Find the user question that preceded this bot response
    const allMsgs = this.messages();
    const idx = allMsgs.findIndex(m => m.id === message.id);
    const userQuestion = idx > 0 ? allMsgs[idx - 1].content : '';

    this.chatbotService.submitFeedback({
      session_id: this.sessionId,
      question: userQuestion,
      answer: message.content,
      language: this.currentLang(),
      is_positive: isPositive,
    }).subscribe();
  }

  sanitizeSvg(svg: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}

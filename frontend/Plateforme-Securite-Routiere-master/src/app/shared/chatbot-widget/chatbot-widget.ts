import { Component, signal, inject, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService, ChatResponse } from '../../core/services/chatbot.service';
import { AuthService } from '../../core/services/auth.service';

interface Message {
  id: number;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isLoading?: boolean;
}

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot-widget.html',
  styleUrl: './chatbot-widget.css',
})
export class ChatbotWidgetComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  private chatbotService = inject(ChatbotService);
  private authService = inject(AuthService);

  // États
  isOpen = signal(false);
  messages = signal<Message[]>([]);
  isLoading = signal(false);
  currentMessage = '';

  // Configuration
  quickActions = [
    { label: 'Panneaux', emoji: '🚦', query: 'Expliquez-moi les panneaux de signalisation' },
    { label: 'Priorité', emoji: '⚠️', query: 'Quelles sont les règles de priorité ?' },
    { label: 'Premiers secours', emoji: '🏥', query: 'Que faire en cas d\'accident ?' },
    { label: 'Vitesse', emoji: '🚗', query: 'Quelles sont les limitations de vitesse ?' },
  ];

  ngOnInit() {
    // Message d'accueil
    this.messages.set([
      {
        id: 1,
        content: 'Bonjour ! 👋 Je suis votre assistant virtuel. Comment puis-je vous aider avec la sécurité routière ?',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  // Ouvrir/Fermer le modal
  toggleChat() {
    this.isOpen.set(!this.isOpen());
  }

  closeChat() {
    this.isOpen.set(false);
  }

  // Envoyer un message
  sendMessage() {
    if (!this.currentMessage.trim() || this.isLoading()) return;

    const messageText = this.currentMessage.trim();

    // Ajouter le message utilisateur
    this.addMessage(messageText, 'user');
    this.currentMessage = '';
    this.isLoading.set(true);

    // Appeler le service chatbot
    this.chatbotService.askQuestion({ question: messageText }).subscribe({
      next: (response: ChatResponse) => {
        this.addMessage(response.answer, 'bot');
        this.isLoading.set(false);
      },
      error: () => {
        this.addMessage('Désolé, je n\'ai pas pu traiter votre demande. Veuillez réessayer.', 'bot');
        this.isLoading.set(false);
      },
    });
  }

  // Envoyer une action rapide
  sendQuickAction(action: { query: string }) {
    this.currentMessage = action.query;
    this.sendMessage();
  }

  // Ajouter un message à l'historique
  private addMessage(content: string, sender: 'user' | 'bot') {
    this.messages.update((msgs) => [
      ...msgs,
      {
        id: Date.now(),
        content,
        sender,
        timestamp: new Date(),
      },
    ]);
  }

  // Auto-scroll vers le dernier message
  private scrollToBottom() {
    if (this.messagesContainer) {
      setTimeout(() => {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }, 0);
    }
  }

  // Effacer le chat
  clearChat() {
    this.messages.set([
      {
        id: 1,
        content: 'Bonjour ! 👋 Je suis votre assistant virtuel. Comment puis-je vous aider avec la sécurité routière ?',
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  }
}

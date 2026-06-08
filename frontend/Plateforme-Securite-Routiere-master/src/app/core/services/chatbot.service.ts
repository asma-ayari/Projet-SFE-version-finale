import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

// --- Interfaces matching backend schemas ---

export interface ChatRequest {
    question: string;
    language?: string;
}

export interface SignInfo {
    name: string;
    description: string;
    image_svg?: string;
    category?: string;
}

export interface SourceInfo {
    citation_id?: string;
    content_preview: string;
    source: string;
    language: string;
    score?: number;
}

export interface ChatResponse {
    answer: string;
    language: string;
    sources_count?: number;
    sources?: SourceInfo[];
    context_found?: boolean;
    signs?: SignInfo[];
}

export interface DetectedSign {
    id: string;
    name: string;
    name_fr: string;
    name_ar: string;
    category: string;
    category_label: string;
    category_emoji: string;
    category_color: string;
    image: string;
}

export interface ImageDetectionResponse {
    signs: DetectedSign[];
    description: string;
    raw_analysis?: string;
    language: string;
    success: boolean;
    error?: string;
}

export interface FeedbackRequest {
    session_id: string;
    question: string;
    answer: string;
    language: string;
    is_positive: boolean;
    comment?: string;
}

export interface Conversation {
    id: number;
    title: string;
    language: string | null;
    created_at: string;
    updated_at: string;
}

export interface Message {
    id: number;
    conversation_id: number;
    role: 'user' | 'assistant';
    content: string;
    language: string | null;
    created_at: string;
}

@Injectable({
    providedIn: 'root',
})
export class ChatbotService {
    private chatUrl = `${environment.apiUrl}/api/chat`;
    private convUrl = `${environment.apiUrl}/api/conversations`;

    constructor(private http: HttpClient) { }

    // --- Chat API ---

    askQuestion(request: ChatRequest, conversationId?: number): Observable<ChatResponse> {
        let params = new HttpParams();
        if (conversationId) {
            params = params.set('conversation_id', conversationId.toString());
        }
        return this.http
            .post<ChatResponse>(`${this.chatUrl}/ask`, request, { params })
            .pipe(catchError(this.handleError));
    }

    detectSign(image: File, language: string = 'fr', conversationId?: number): Observable<ImageDetectionResponse> {
        const formData = new FormData();
        formData.append('image', image);
        formData.append('language', language);
        if (conversationId) {
            formData.append('conversation_id', conversationId.toString());
        }
        return this.http
            .post<ImageDetectionResponse>(`${this.chatUrl}/detect-sign`, formData)
            .pipe(catchError(this.handleError));
    }

    submitFeedback(feedback: FeedbackRequest): Observable<any> {
        return this.http
            .post(`${this.chatUrl}/feedback`, feedback)
            .pipe(catchError(this.handleError));
    }

    getStats(): Observable<any> {
        return this.http
            .get(`${this.chatUrl}/stats`)
            .pipe(catchError(this.handleError));
    }

    // --- Conversations API ---

    getConversations(): Observable<Conversation[]> {
        return this.http
            .get<Conversation[]>(this.convUrl)
            .pipe(catchError(this.handleError));
    }

    createConversation(title: string = 'Nouvelle conversation'): Observable<Conversation> {
        return this.http
            .post<Conversation>(this.convUrl, { title })
            .pipe(catchError(this.handleError));
    }

    getMessages(conversationId: number): Observable<Message[]> {
        return this.http
            .get<{ messages: Message[] }>(`${this.convUrl}/${conversationId}`)
            .pipe(map(conv => conv.messages), catchError(this.handleError));
    }

    deleteConversation(conversationId: number): Observable<any> {
        return this.http
            .delete(`${this.convUrl}/${conversationId}`)
            .pipe(catchError(this.handleError));
    }

    // --- Error Handler ---

    private handleError(error: any): Observable<never> {
        let message = 'Une erreur est survenue';
        if (error.error?.detail) {
            message = error.error.detail;
        } else if (error.status === 0) {
            message = 'Impossible de contacter le serveur';
        }
        return throwError(() => ({ message, status: error.status, original: error }));
    }
}

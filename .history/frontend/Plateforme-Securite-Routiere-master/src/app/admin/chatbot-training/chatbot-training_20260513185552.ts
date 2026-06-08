import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { timeout } from 'rxjs/operators';

interface IngestionHistory {
  id?: string;
  date: Date;
  status: 'success' | 'error' | 'pending';
  documentsCount: number;
  chunksCount?: number;
  message: string;
}

@Component({
  selector: 'app-chatbot-training',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './chatbot-training.html',
  styleUrl: './chatbot-training.css',
})
export class ChatbotTraining implements OnInit {
  stats: any = null;
  loading = false;
  ingesting = false;
  error = '';
  success = '';
  ingestResult: any = null;
  ingestingSteps = 0; // 0-4 steps
  ingestionHistory: IngestionHistory[] = [];
  loadError = '';

  private api = `${environment.apiUrl}/api/documents`;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private translate: TranslateService) { }

  ngOnInit() {
    this.loadStats();
    this.loadIngestionHistory();
  }

  loadStats() {
    this.loading = true;
    this.loadError = '';
    this.error = '';

    this.http.get<any>(`${this.api}/stats`).pipe(
      timeout(10000) // 10 secondes timeout
    ).subscribe({
      next: (res) => {
        this.stats = res;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.loadError = this.translate.instant('ADMIN.CHATBOT_TRAINING.STATS_LOAD_ERROR');
        this.error = this.loadError;
        this.loading = false;
        this.cdr.markForCheck();
        console.error('Erreur lors du chargement des stats:', err);
      }
    });
  }

  startIngestion() {
    if (!confirm(this.translate.instant('ADMIN.CHATBOT_TRAINING.CONFIRM_INGEST'))) return;
    
    this.ingesting = true;
    this.ingestingSteps = 1;
    this.error = '';
    this.success = '';
    this.ingestResult = null;
    this.cdr.markForCheck();

    this.http.post<any>(`${this.api}/ingest`, {}).pipe(
      timeout(600000) // 10 minutes timeout (ingestion can be long)
    ).subscribe({
      next: (res) => {
        this.ingestingSteps = 4; // Terminé
        this.ingestResult = res;
        this.success = res.message || this.translate.instant('ADMIN.CHATBOT_TRAINING.INGEST_SUCCESS');
        this.ingesting = false;
        
        // Ajouter à l'historique
        const histEntry: IngestionHistory = {
          date: new Date(),
          status: res.status === 'success' ? 'success' : 'error',
          documentsCount: res.documents_count || 0,
          chunksCount: res.stats?.total_chunks,
          message: res.message
        };
        this.ingestionHistory.unshift(histEntry);
        this.saveIngestionHistory();
        
        this.loadStats();
        this.cdr.markForCheck();
        
        setTimeout(() => { this.ingestingSteps = 0; }, 3000);
      },
      error: (err) => {
        this.ingestingSteps = 0;
        this.error = err.error?.detail || this.translate.instant('ADMIN.CHATBOT_TRAINING.INGEST_ERROR');
        this.ingesting = false;
        
        // Ajouter à l'historique
        const histEntry: IngestionHistory = {
          date: new Date(),
          status: 'error',
          documentsCount: 0,
          message: this.error
        };
        this.ingestionHistory.unshift(histEntry);
        this.saveIngestionHistory();
        
        this.cdr.markForCheck();
        console.error('Erreur lors de l\'ingestion:', err);
      }
    });
  }

  loadIngestionHistory() {
    try {
      const saved = localStorage.getItem('ingestionHistory');
      if (saved) {
        const parsed = JSON.parse(saved);
        this.ingestionHistory = parsed.map((item: any) => ({
          ...item,
          date: new Date(item.date)
        }));
      }
    } catch (e) {
      console.error('Erreur lors du chargement de l\'historique:', e);
    }
  }

  saveIngestionHistory() {
    try {
      // Garder seulement les 10 dernières ingestions
      const toSave = this.ingestionHistory.slice(0, 10);
      localStorage.setItem('ingestionHistory', JSON.stringify(toSave));
    } catch (e) {
      console.error('Erreur lors de la sauvegarde de l\'historique:', e);
    }
  }

  clearHistory() {
    this.ingestionHistory = [];
    localStorage.removeItem('ingestionHistory');
    this.cdr.markForCheck();
  }

  formatSize(bytes: number): string {
    if (!bytes) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleString('fr-FR');
  }

  getStepIcon(step: number): string {
    const icons = [
      'bi-files',
      'bi-scissors',
      'bi-diagram-3',
      'bi-check-circle'
    ];
    return icons[step] || 'bi-loader';
  }

  getProgressPercent(): number {
    return (this.ingestingSteps / 4) * 100;
  }
}

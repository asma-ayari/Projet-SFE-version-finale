import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

interface DocFile {
  name: string;
  language: string;
  size: number;
  extension: string;
  path: string;
  base64Data?: string;
}

@Component({
  selector: 'app-documents-management',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './documents-management.html',
  styleUrl: './documents-management.css',
})
export class DocumentsManagement implements OnInit {
  documents: DocFile[] = [];
  loading = false;
  uploading = false;
  error = '';
  success = '';
  filterLang = '';

  // Upload form
  selectedFile: File | null = null;
  uploadLang = 'fr';

  private api = `${environment.apiUrl}/api/documents`;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, private translate: TranslateService) { }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    const url = this.filterLang ? `${this.api}?lang=${this.filterLang}` : this.api;
    this.http.get<{ documents: DocFile[]; total: number }>(url).subscribe({
      next: (res) => {
        this.documents = res.documents;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.error = err.error?.detail || this.translate.instant('ADMIN.DOCUMENTS.LOADING_ERROR');
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  upload() {
    if (!this.selectedFile) return;
    this.uploading = true;
    this.error = '';

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('language', this.uploadLang);

    this.http.post<{ message: string; file: DocFile }>(`${this.api}/upload`, formData).subscribe({
      next: (res) => {
        this.success = res.message || this.translate.instant('ADMIN.DOCUMENTS.UPLOAD_SUCCESS');
        this.selectedFile = null;
        this.uploading = false;
        this.cdr.markForCheck();
        this.load();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error?.detail || this.translate.instant('ADMIN.DOCUMENTS.UPLOAD_ERROR');
        this.uploading = false;
        this.cdr.markForCheck();
      }
    });
  }

  deleteDoc(doc: DocFile) {
    if (!confirm(this.translate.instant('ADMIN.DOCUMENTS.CONFIRM_DELETE') + ` "${doc.name}" ?`)) return;
    this.http.delete<{ message: string }>(`${this.api}/${doc.language}/${doc.name}`).subscribe({
      next: (res) => {
        this.success = res.message || this.translate.instant('ADMIN.DOCUMENTS.DELETE_SUCCESS');
        this.cdr.markForCheck();
        this.load();
        setTimeout(() => this.success = '', 3000);
      },
      error: () => {
        this.error = this.translate.instant('ADMIN.DOCUMENTS.DELETE_ERROR');
        this.cdr.markForCheck();
      }
    });
  }

  previewDoc(doc: DocFile) {
    // Récupérer le fichier en base64 pour créer un Blob URL
    this.http.get<{ base64Data: string }>(`${this.api}/file-base64/${doc.language}/${doc.name}`).subscribe({
      next: (res) => {
        // Convertir base64 en Blob URL
        const byteCharacters = atob(res.base64Data);
        const byteNumbers = Array.from(byteCharacters).map(c => c.charCodeAt(0));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: this.getMimeType(doc.extension) });
        const blobUrl = URL.createObjectURL(blob);
        
        // Ouvrir le fichier dans une nouvelle fenêtre
        window.open(blobUrl, '_blank');
      },
      error: () => {
        this.error = this.translate.instant('ADMIN.DOCUMENTS.PREVIEW_ERROR');
        this.cdr.markForCheck();
      }
    });
  }

  downloadDoc(doc: DocFile) {
    // Récupérer le fichier en base64 pour le télécharger
    this.http.get<{ base64Data: string }>(`${this.api}/file-base64/${doc.language}/${doc.name}`).subscribe({
      next: (res) => {
        // Convertir base64 en Blob
        const byteCharacters = atob(res.base64Data);
        const byteNumbers = Array.from(byteCharacters).map(c => c.charCodeAt(0));
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: this.getMimeType(doc.extension) });
        const blobUrl = URL.createObjectURL(blob);
        
        // Créer un lien de téléchargement et déclencher le clic
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = doc.name; // Force le téléchargement avec l'extension correcte
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Libérer la mémoire
        URL.revokeObjectURL(blobUrl);
      },
      error: () => {
        this.error = this.translate.instant('ADMIN.DOCUMENTS.DOWNLOAD_ERROR');
        this.cdr.markForCheck();
      }
    });
  }

  private getMimeType(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain',
    };
    return mimeTypes[extension] || 'application/octet-stream';
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getExtIcon(ext: string): string {
    switch (ext) {
      case '.pdf': return 'bi-file-earmark-pdf text-danger';
      case '.docx': return 'bi-file-earmark-word text-primary';
      case '.txt': return 'bi-file-earmark-text text-secondary';
      default: return 'bi-file-earmark';
    }
  }
}

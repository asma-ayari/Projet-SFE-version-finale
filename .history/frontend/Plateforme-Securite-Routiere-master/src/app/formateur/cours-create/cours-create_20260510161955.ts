import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CoursService, CourseCreate } from '../../core/services/cours';

@Component({
  selector: 'app-cours-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './cours-create.html',
  styleUrl: './cours-create.css',
})
export class CoursCreate {
  title = '';
  description = '';
  category = 'general';
  level = 'debutant';
  duration = '';
  image_url = '';
  video_url = '';
  content = '';
  saving = false;
  error = '';

  constructor(
    private coursService: CoursService,
    private router: Router,
    private translate: TranslateService
  ) { }

  save() {
    if (!this.title.trim()) {
      this.error = this.translate.instant('FORMATEUR.COURS_CREATE.MESSAGES.TITLE_REQUIRED');
      return;
    }
    this.saving = true;
    this.error = '';

    const payload: CourseCreate = {
      title: this.title,
      description: this.description || undefined,
      category: this.category,
      level: this.level,
      duration: this.duration || undefined,
      image_url: this.image_url || undefined,
      video_url: this.video_url || undefined,
      content: this.content || undefined,
    };

    this.coursService.create(payload).subscribe({
      next: () => this.router.navigate(['/formateur/cours']),
      error: (e) => {
        this.error = e.error?.detail || this.translate.instant('FORMATEUR.COURS_CREATE.MESSAGES.CREATE_ERROR');
        this.saving = false;
      }
    });
  }
}

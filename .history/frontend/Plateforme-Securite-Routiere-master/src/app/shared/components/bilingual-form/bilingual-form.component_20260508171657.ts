/**
 * Template Réutilisable pour les Formulaires Bilingues
 * Utiliser ce composant comme base pour tous les formulaires
 */

import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { i18n } from '../i18n/i18n.config';

interface FormConfig {
  fields: FormField[];
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
}

interface FormField {
  name: string;
  label: string; // Clé de traduction
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  pattern?: string;
  options?: { value: any; label: string }[];
  cols?: number;
  rows?: number;
}

/**
 * Composant de formulaire réutilisable avec support bilingue
 */
@Component({
  selector: 'app-bilingual-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  template: `
    <form 
      [formGroup]="form"
      (ngSubmit)="onSubmit()"
      class="bilingual-form"
      [dir]="language.isRTL() ? 'rtl' : 'ltr'"
      [class.form-rtl]="language.isRTL()">
      
      <!-- Form Fields -->
      <div class="form-group" *ngFor="let field of config.fields">
        <label [for]="field.name" class="form-label">
          {{ field.label | translate }}
          <span *ngIf="field.required" class="required">*</span>
        </label>

        <!-- Text Input -->
        <input
          *ngIf="['text', 'email', 'password', 'number', 'date'].includes(field.type)"
          [id]="field.name"
          [type]="field.type"
          [formControlName]="field.name"
          class="form-control"
          [placeholder]="field.placeholder | translate"
          [pattern]="field.pattern" />

        <!-- Select -->
        <select
          *ngIf="field.type === 'select'"
          [id]="field.name"
          [formControlName]="field.name"
          class="form-control">
          <option value="">{{ 'COMMON.SEARCH' | translate }}</option>
          <option *ngFor="let opt of field.options" [value]="opt.value">
            {{ opt.label | translate }}
          </option>
        </select>

        <!-- Textarea -->
        <textarea
          *ngIf="field.type === 'textarea'"
          [id]="field.name"
          [formControlName]="field.name"
          [cols]="field.cols || 40"
          [rows]="field.rows || 4"
          class="form-control"
          [placeholder]="field.placeholder | translate"></textarea>

        <!-- Checkbox -->
        <div *ngIf="field.type === 'checkbox'" class="form-check">
          <input
            type="checkbox"
            [id]="field.name"
            [formControlName]="field.name"
            class="form-check-input" />
          <label class="form-check-label" [for]="field.name">
            {{ field.label | translate }}
          </label>
        </div>

        <!-- Error Messages -->
        <div
          *ngIf="getFieldError(field.name)"
          class="form-error">
          {{ getFieldErrorMessage(field.name) | translate }}
        </div>
      </div>

      <!-- Form Actions -->
      <div class="form-actions">
        <button
          type="submit"
          class="btn btn-primary"
          [disabled]="!form.valid">
          {{ (config.submitLabel || 'COMMON.SAVE') | translate }}
        </button>
        
        <button
          type="button"
          class="btn btn-secondary"
          (click)="onCancel()">
          {{ (config.cancelLabel || 'COMMON.CANCEL') | translate }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    .bilingual-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 2rem;
      background: #f8f9fa;
      border-radius: 8px;

      &.form-rtl {
        direction: rtl;
        text-align: right;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-label {
      font-weight: 600;
      color: #333;
      
      .required {
        color: #dc3545;
        margin-inline-start: 0.25rem;
      }
    }

    .form-control,
    .form-check-input,
    select,
    textarea {
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: inherit;
      font-size: 1rem;
      transition: all 0.3s ease;

      &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      &:invalid {
        border-color: #dc3545;
      }
    }

    .form-error {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .form-check {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .form-check-input {
        width: 1.25rem;
        height: 1.25rem;
        cursor: pointer;
      }

      .form-check-label {
        cursor: pointer;
        margin: 0;
      }
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #ddd;

      .btn {
        padding: 0.75rem 1.5rem;
        border-radius: 4px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;

        &.btn-primary {
          background: #667eea;
          color: white;
          border: none;

          &:hover:not(:disabled) {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }

        &.btn-secondary {
          background: #e9ecef;
          color: #333;
          border: 1px solid #ddd;

          &:hover {
            background: #dee2e6;
          }
        }
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .bilingual-form {
        padding: 1rem;
        gap: 1rem;
      }

      .form-actions {
        flex-direction: column;
        gap: 0.5rem;

        .btn {
          width: 100%;
        }
      }
    }
  `]
})
export class BilingualFormComponent {
  @Input() config!: FormConfig;
  @Output() submitted = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;
  language = inject(LanguageService);
  private fb = inject(FormBuilder);
  i18n = i18n;

  ngOnInit() {
    this.initializeForm();
  }

  /**
   * Initialise le formulaire avec les champs
   */
  private initializeForm(): void {
    const formConfig: { [key: string]: any } = {};

    this.config.fields.forEach(field => {
      const validators: any[] = [];
      
      if (field.required) {
        validators.push(Validators.required);
      }
      
      if (field.pattern) {
        validators.push(Validators.pattern(field.pattern));
      }

      if (field.type === 'email') {
        validators.push(Validators.email);
      }

      formConfig[field.name] = ['', validators];
    });

    this.form = this.fb.group(formConfig);
  }

  /**
   * Soumission du formulaire
   */
  onSubmit(): void {
    if (this.form.valid) {
      this.config.onSubmit(this.form.value);
      this.submitted.emit(this.form.value);
    }
  }

  /**
   * Annulation du formulaire
   */
  onCancel(): void {
    this.form.reset();
    this.config.onCancel?.();
    this.cancelled.emit();
  }

  /**
   * Récupère l'erreur d'un champ
   */
  getFieldError(fieldName: string): any {
    const field = this.form.get(fieldName);
    return field?.errors;
  }

  /**
   * Récupère le message d'erreur
   */
  getFieldErrorMessage(fieldName: string): string {
    const errors = this.getFieldError(fieldName);
    if (errors?.required) {
      return 'PLEASE_FILL_REQUIRED';
    }
    if (errors?.pattern) {
      return 'INVALID_FORMAT';
    }
    if (errors?.email) {
      return 'INVALID_EMAIL';
    }
    return 'INVALID_INPUT';
  }
}

/**
 * Exemple d'utilisation:
 * 
 * const formConfig: FormConfig = {
 *   fields: [
 *     {
 *       name: 'firstName',
 *       label: 'APPRENANT.PROFILE.FIRST_NAME',
 *       type: 'text',
 *       required: true
 *     },
 *     {
 *       name: 'email',
 *       label: 'APPRENANT.PROFILE.EMAIL',
 *       type: 'email',
 *       required: true
 *     }
 *   ],
 *   submitLabel: 'COMMON.SAVE',
 *   onSubmit: (data) => console.log(data)
 * };
 * 
 * // Dans le template:
 * <app-bilingual-form [config]="formConfig"></app-bilingual-form>
 */

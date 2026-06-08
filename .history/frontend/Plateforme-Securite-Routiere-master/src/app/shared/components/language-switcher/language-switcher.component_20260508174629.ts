import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../core/services/language.service';

/**
 * Composant Language Switcher
 * Permet de basculer entre FR et AR
 * Supporte le mode RTL automatiquement
 */
@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="language-switcher" [class.rtl]="language.isRTL()">
      <!-- Button French -->
      <button
        (click)="switchLanguage('fr')"
        [class.active]="language.currentLanguage() === 'fr'"
        class="lang-btn lang-btn-fr"
        aria-label="Switch to French"
        [title]="'FR' | translate">
        <span class="lang-code">FR</span>
        <span class="lang-label">Français</span>
      </button>

      <!-- Separator -->
      <div class="separator"></div>

      <!-- Button Arabic -->
      <button
        (click)="switchLanguage('ar')"
        [class.active]="language.currentLanguage() === 'ar'"
        class="lang-btn lang-btn-ar"
        aria-label="Switch to Arabic"
        [title]="'ع' | translate">
        <span class="lang-code">ع</span>
        <span class="lang-label">العربية</span>
      </button>
    </div>
  `,
  styles: [`
    .language-switcher {
      display: flex;
      align-items: center;
      gap: 0;
      background: rgba(255, 255, 255, 0.1);
      padding: 0.5rem;
      border-radius: 25px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.3);
      }

      &.rtl {
        direction: rtl;
      }
    }

    .lang-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      font-weight: 600;
      padding: 0.5rem 0.75rem;
      border-radius: 15px;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      white-space: nowrap;

      .lang-code {
        display: inline-block;
        font-size: 1rem;
      }

      .lang-label {
        display: none;
        font-size: 0.85rem;
      }

      &:hover:not(.active) {
        background: rgba(255, 255, 255, 0.1);
        transform: scale(1.05);
      }

      &.active {
        background: rgba(255, 255, 255, 0.25);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      &.lang-btn-ar {
        font-family: 'Droid Arabic Naskh', 'Arial', sans-serif;

        .lang-code {
          font-size: 1.2rem;
        }
      }
    }

    .separator {
      width: 1px;
      height: 20px;
      background: rgba(255, 255, 255, 0.3);
      margin: 0 0.25rem;
    }

    /* Responsive - Show labels on larger screens */
    @media (min-width: 768px) {
      .lang-btn .lang-label {
        display: inline;
      }

      .lang-btn {
        padding: 0.5rem 1rem;
      }
    }

    /* Mobile-friendly */
    @media (max-width: 576px) {
      .language-switcher {
        padding: 0.25rem;
      }

      .lang-btn {
        padding: 0.4rem 0.6rem;
        font-size: 0.8rem;
      }

      .separator {
        margin: 0;
      }
    }
  `]
})
export class LanguageSwitcherComponent {
  language = inject(LanguageService);

  /**
   * Change la langue active
   * @param lang Langue à appliquer
   */
  switchLanguage(lang: 'fr' | 'ar'): void {
    if (this.language.currentLanguage() !== lang) {
      this.language.setLanguage(lang);
    }
  }

  /**
   * Bascule la langue
   */
  toggleLanguage(): void {
    this.language.toggleLanguage();
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../core/services/language.service';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

/**
 * Composant Navbar avec support bilingue complet
 * Intègre le Language Switcher et applique les styles RTL/LTR
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, TranslateModule, LanguageSwitcherComponent],
  template: `
    <nav 
      class="navbar" 
      [dir]="language.isRTL() ? 'rtl' : 'ltr'"
      [class.navbar-rtl]="language.isRTL()"
      [class.navbar-ltr]="language.isFrench()">
      
      <!-- Navbar brand -->
      <div class="navbar-brand">
        <a href="/" class="brand-link">
          <span class="brand-icon">🛣️</span>
          <span class="brand-text">{{ 'NAV.HOME' | translate }}</span>
        </a>
      </div>

      <!-- Navigation menu -->
      <div class="navbar-menu">
        <a href="/courses" class="nav-link">
          {{ 'NAV.COURSES' | translate }}
        </a>
        <a href="/qcm" class="nav-link">
          {{ 'NAV.QCM' | translate }}
        </a>
        <a href="/chatbot" class="nav-link">
          {{ 'NAV.CHATBOT' | translate }}
        </a>
      </div>

      <!-- Right side items (Language switcher + Auth) -->
      <div class="navbar-end">
        <app-language-switcher></app-language-switcher>
        
        <div class="auth-buttons">
          <a href="/login" class="btn btn-outline">
            {{ 'NAV.LOGIN' | translate }}
          </a>
          <a href="/register" class="btn btn-primary">
            {{ 'NAV.REGISTER' | translate }}
          </a>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      &.navbar-rtl {
        direction: rtl;
        text-align: right;
      }

      &.navbar-ltr {
        direction: ltr;
        text-align: left;
      }
    }

    .navbar-brand {
      flex-shrink: 0;

      .brand-link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: white;
        text-decoration: none;
        font-weight: 700;
        font-size: 1.2rem;
        transition: transform 0.3s ease;

        &:hover {
          transform: scale(1.05);
        }
      }

      .brand-icon {
        font-size: 1.5rem;
      }

      .brand-text {
        display: none;
      }
    }

    .navbar-menu {
      display: flex;
      gap: 2rem;
      flex: 1;
      justify-content: center;

      .nav-link {
        color: white;
        text-decoration: none;
        font-weight: 500;
        padding: 0.5rem 0;
        border-bottom: 2px solid transparent;
        transition: all 0.3s ease;

        &:hover {
          border-bottom-color: white;
          transform: translateY(-2px);
        }
      }
    }

    .navbar-end {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      flex-shrink: 0;
    }

    .auth-buttons {
      display: flex;
      gap: 1rem;
      align-items: center;

      .btn {
        padding: 0.5rem 1rem;
        border-radius: 5px;
        text-decoration: none;
        font-weight: 600;
        font-size: 0.9rem;
        transition: all 0.3s ease;
        border: 2px solid white;

        &.btn-outline {
          background: transparent;
          color: white;

          &:hover {
            background: white;
            color: #667eea;
          }
        }

        &.btn-primary {
          background: white;
          color: #667eea;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          }
        }
      }
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .navbar {
        flex-wrap: wrap;
        gap: 1rem;
        padding: 1rem;
      }

      .navbar-menu {
        gap: 1rem;
        order: 3;
        width: 100%;
      }

      .navbar-brand .brand-text {
        display: inline;
      }
    }

    @media (max-width: 768px) {
      .navbar {
        padding: 0.75rem;
      }

      .navbar-menu {
        display: none;
      }

      .auth-buttons {
        gap: 0.5rem;

        .btn {
          padding: 0.4rem 0.8rem;
          font-size: 0.8rem;
        }
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  language = inject(LanguageService);

  ngOnInit(): void {
    // Listener pour les changements de langue
    window.addEventListener('languageChanged', (event: any) => {
      // Vous pouvez faire des actions supplémentaires ici
      console.log('Language changed to:', event.detail.language);
    });
  }
}

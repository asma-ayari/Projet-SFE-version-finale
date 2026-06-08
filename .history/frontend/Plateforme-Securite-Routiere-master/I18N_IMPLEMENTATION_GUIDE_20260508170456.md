# 🌍 Guide d'Implémentation Bilingue (FR/AR)

## 📋 Vue d'ensemble

Ce guide explique comment implémenter une interface **bilingue complète** (Français/Arabe) avec gestion automatique de la direction (LTR/RTL).

---

## 🎯 Fichiers de Traduction

### Structure des fichiers

```
public/locales/
├── fr/
│   └── translation.json      # Traductions françaises
└── ar/
    └── translation.json      # Traductions arabes (الفصحى)
```

### Contenu couvert

✅ **Navigation globale** (NAV)  
✅ **Admin** (فضاء المشرف) - Gestion complète de la plateforme  
✅ **Apprenant** (فضاء المتعلم) - Interface d'apprentissage  
✅ **Formateur** (فضاء المكوّن) - Outils de création  
✅ **Interface QCM** - Tests interactifs  
✅ **Système de notifications** - Messages système  
✅ **Gestion des erreurs** - Pages d'erreur  

---

## 🔧 Configuration @ngx-translate

### 1. Installation des dépendances

```bash
npm install @ngx-translate/core @ngx-translate/http-loader
```

### 2. Setup dans `app.config.ts`

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, provideHttpClient } from '@angular/common/http';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './locales/', '/translation.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideTranslateService({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      },
      defaultLanguage: 'fr',
      supportedLanguages: ['fr', 'ar']
    })
  ]
};
```

### 3. Service de langue (Language Service)

```typescript
// src/app/core/services/language.service.ts
import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  currentLanguage = signal<'fr' | 'ar'>('fr');
  isRTL = signal(false);

  constructor(private translateService: TranslateService) {
    this.initializeLanguage();
  }

  private initializeLanguage() {
    const savedLanguage = localStorage.getItem('language') as 'fr' | 'ar' || 'fr';
    this.setLanguage(savedLanguage);
  }

  setLanguage(lang: 'fr' | 'ar') {
    this.currentLanguage.set(lang);
    this.isRTL.set(lang === 'ar');
    
    // Appliquer la direction au document
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    // Changer la police pour l'arabe
    if (lang === 'ar') {
      document.documentElement.style.fontFamily = "'Droid Arabic Naskh', 'Arabic Typesetting', serif";
    } else {
      document.documentElement.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    }
    
    this.translateService.use(lang);
    localStorage.setItem('language', lang);
  }

  toggleLanguage() {
    const newLang = this.currentLanguage() === 'fr' ? 'ar' : 'fr';
    this.setLanguage(newLang);
  }
}
```

---

## 🎨 Composant Language Switcher

### 1. Composant `language-switcher.component.ts`

```typescript
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="language-switcher">
      <button 
        (click)="switchLanguage('fr')"
        [class.active]="language.currentLanguage() === 'fr'"
        class="lang-btn"
        aria-label="Switch to French">
        FR
      </button>
      <span class="separator">|</span>
      <button 
        (click)="switchLanguage('ar')"
        [class.active]="language.currentLanguage() === 'ar'"
        class="lang-btn"
        aria-label="Switch to Arabic">
        ع
      </button>
    </div>
  `,
  styles: [`
    .language-switcher {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      padding: 0.5rem 1rem;
      border-radius: 20px;
      backdrop-filter: blur(10px);
    }

    .lang-btn {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
      transition: all 0.3s ease;
      
      &:hover {
        transform: scale(1.1);
      }

      &.active {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        padding: 0.25rem 0.75rem;
      }
    }

    .separator {
      opacity: 0.5;
      margin: 0 0.25rem;
    }
  `]
})
export class LanguageSwitcherComponent {
  language = inject(LanguageService);

  switchLanguage(lang: 'fr' | 'ar') {
    this.language.setLanguage(lang);
  }
}
```

### 2. Intégration dans la navbar

```typescript
// src/app/shared/navbar/navbar.component.ts
import { Component, inject } from '@angular/core';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';

@Component({
  selector: 'app-navbar',
  imports: [LanguageSwitcherComponent],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">Logo</div>
      <div class="navbar-menu">
        <!-- Menu items -->
      </div>
      <app-language-switcher></app-language-switcher>
    </nav>
  `
})
export class NavbarComponent {}
```

---

## 🔄 Utilisation des traductions dans les templates

### 1. Pipe de traduction

```html
<!-- Simple translation -->
<h1>{{ 'ADMIN.TITLE' | translate }}</h1>

<!-- With parameters -->
<p>{{ 'WELCOME_USER' | translate: { name: userName } }}</p>

<!-- Conditional by language -->
<div [dir]="language.isRTL() ? 'rtl' : 'ltr'">
  <!-- Content -->
</div>
```

### 2. Dans les composants TypeScript

```typescript
import { TranslateService } from '@ngx-translate/core';

export class MyComponent {
  constructor(private translate: TranslateService) {}

  getTranslation() {
    this.translate.get('ADMIN.DASHBOARD.TITLE').subscribe((res: string) => {
      console.log(res);
    });
  }
}
```

---

## 🎯 Implémentation par espace

### Admin Dashboard

```html
<div class="admin-container" [dir]="language.isRTL() ? 'rtl' : 'ltr'">
  <h1>{{ 'ADMIN.TITLE' | translate }}</h1>
  <p>{{ 'ADMIN.SUBTITLE' | translate }}</p>
  
  <div class="metrics-grid">
    <div class="metric-card">
      <span>{{ 'ADMIN.DASHBOARD.METRICS.TOTAL_USERS' | translate }}</span>
      <strong>{{ totalUsers }}</strong>
    </div>
    <div class="metric-card">
      <span>{{ 'ADMIN.DASHBOARD.METRICS.COURSES_PUBLISHED' | translate }}</span>
      <strong>{{ publishedCourses }}</strong>
    </div>
  </div>
</div>
```

### Learner Dashboard

```html
<div class="learner-container" [dir]="language.isRTL() ? 'rtl' : 'ltr'">
  <h1>{{ 'APPRENANT.TITLE' | translate }}</h1>
  <div class="welcome-section">
    <h2>{{ 'APPRENANT.DASHBOARD.WELCOME' | translate }}, {{ userName }}!</h2>
  </div>
  
  <div class="courses-section">
    <h3>{{ 'APPRENANT.COURSES.TITLE' | translate }}</h3>
    <!-- Courses list -->
  </div>
</div>
```

### Trainer Dashboard

```html
<div class="trainer-container" [dir]="language.isRTL() ? 'rtl' : 'ltr'">
  <h1>{{ 'FORMATEUR.TITLE' | translate }}</h1>
  <div class="statistics">
    <div class="stat">
      <span>{{ 'FORMATEUR.DASHBOARD.COURSES_CREATED' | translate }}</span>
      <strong>{{ courseCount }}</strong>
    </div>
  </div>
</div>
```

---

## 🎨 CSS et Flexibilité RTL

### Utiliser CSS Logiques (Recommandé)

```css
/* Utiliser les propriétés logiques au lieu de gauche/droite */

/* ❌ Éviter */
.sidebar {
  left: 0;
  padding-left: 20px;
}

/* ✅ Utiliser */
.sidebar {
  inset-inline-start: 0;
  padding-inline-start: 20px;
}

/* Exemples de propriétés logiques */
margin-inline-start  /* Remplace margin-left/margin-right */
margin-inline-end    /* Remplace margin-right/margin-left */
padding-inline      /* Remplace padding-left/padding-right */
text-align: start    /* Remplace text-align: left */
text-align: end      /* Remplace text-align: right */
```

### Flexbox et Grid

```css
/* Flexbox s'adapte automatiquement à RTL */
.container {
  display: flex;
  flex-direction: row; /* Devient automatiquement row-reverse en RTL */
}

/* Mais mieux d'utiliser flex-start et flex-end */
.item {
  margin-inline-end: 1rem;
}
```

### Exemple complet

```css
.card {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  
  /* Utiliser les valeurs logiques */
  margin-inline: auto;
  padding-inline: 1rem;
  border-inline-start: 3px solid #007bff;
}

.card-icon {
  /* Pas besoin de float, flexbox gère automatiquement */
  flex-shrink: 0;
  width: 40px;
  height: 40px;
}

.card-content {
  flex: 1;
  text-align: start;
}
```

---

## 📱 Responsive Design

### Media Queries avec Direction

```css
@media (prefers-text-direction: rtl) {
  /* Styles spécifiques pour l'arabe */
  body {
    font-family: 'Arial', 'Droid Arabic Naskh', sans-serif;
  }
}

@media (prefers-text-direction: ltr) {
  /* Styles spécifiques pour le français */
  body {
    font-family: 'Segoe UI', sans-serif;
  }
}
```

### Breakpoints

```scss
// Mobile-first approach avec support RTL
$mobile: 576px;
$tablet: 768px;
$desktop: 1024px;

@mixin respond-to($device) {
  @media (min-width: $device) {
    @content;
  }
}

.navbar {
  display: flex;
  flex-direction: column;
  
  @include respond-to($tablet) {
    flex-direction: row;
  }
}
```

---

## ✅ Checklist d'Implémentation

- [ ] **Fichiers de traduction**
  - [ ] `fr/translation.json` - Configuré ✓
  - [ ] `ar/translation.json` - Configuré en arabe moderne ✓

- [ ] **Service de langue**
  - [ ] LanguageService créé
  - [ ] Gestion de `dir` (rtl/ltr) automati que
  - [ ] Stockage persistant (localStorage)

- [ ] **Composants**
  - [ ] Language Switcher dans la navbar
  - [ ] Pipe translate dans tous les templates
  - [ ] Support [dir] dynamique

- [ ] **Styles**
  - [ ] Utiliser les propriétés logiques CSS
  - [ ] Flexbox/Grid au lieu de floats
  - [ ] Polices adaptées (Droid Arabic pour AR)

- [ ] **Tests**
  - [ ] Test switcher FR → AR
  - [ ] Test RTL/LTR switching
  - [ ] Test persistance de la langue
  - [ ] Test responsive en RTL

---

## 🚀 Déploiement

```bash
# Build optimisé
ng build --configuration production

# Vérifier les traductions
npm run i18n:validate

# Tester en arabe
ng serve --open # Puis switcher à l'arabe
```

---

## 📚 Ressources Clés

| Concept | Fichier | Clés |
|---------|---------|------|
| Navigation | NAV | HOME, COURSES, DASHBOARD |
| Admin | ADMIN.* | USERS, COURSES, QCM, SETTINGS |
| Apprenant | APPRENANT.* | DASHBOARD, COURSES, QCM |
| Formateur | FORMATEUR.* | COURSES, STUDENTS, MATERIALS |
| Notifications | NOTIFICATIONS_SYSTEM | SUCCESS, ERROR, WARNING |

---

## 🎓 Exemple Complet

```html
<!-- app.component.html -->
<div [dir]="language.isRTL() ? 'rtl' : 'ltr'" [class.rtl]="language.isRTL()">
  <app-navbar></app-navbar>
  
  <main class="main-content">
    <router-outlet></router-outlet>
  </main>
  
  <app-footer></app-footer>
</div>
```

```typescript
// app.component.ts
import { Component, inject } from '@angular/core';
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'app-root',
  template: `...`
})
export class AppComponent {
  language = inject(LanguageService);
}
```

---

## 📞 Support

Pour toute question sur l'implémentation bilingue:
- Vérifier les fichiers JSON des traductions
- Tester le Language Service
- Vérifier les propriétés CSS logiques
- Consulter la documentation @ngx-translate

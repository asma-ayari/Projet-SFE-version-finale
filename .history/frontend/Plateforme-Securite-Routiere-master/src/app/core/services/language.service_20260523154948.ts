import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  currentLang = signal<'fr' | 'ar'>('fr');
  
  constructor(private translate: TranslateService) {
    this.translate.addLangs(['fr', 'ar']);
    // Set default language
    this.translate.setDefaultLang('fr');
    
    // Get saved language from localStorage or use default
    const savedLang = localStorage.getItem('lang') as 'fr' | 'ar';
    if (savedLang) {
      this.setLanguage(savedLang);
    } else {
      this.setLanguage('fr');
    }
  }

  setLanguage(lang: 'fr' | 'ar') {
    this.currentLang.set(lang);
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    
    // Update document direction for RTL support
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    // Add/remove RTL class on body
    if (lang === 'ar') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }

  toggleLanguage() {
    const newLang = this.currentLang() === 'fr' ? 'ar' : 'fr';
    this.setLanguage(newLang);
  }

  getCurrentLang(): 'fr' | 'ar' {
    return this.currentLang();
  }

  
}

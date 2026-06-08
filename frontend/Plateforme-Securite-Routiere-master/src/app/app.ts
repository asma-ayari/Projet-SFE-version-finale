import { Component, signal, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Header } from './shared/header/header';
import { Footer } from './shared/footer/footer';
import { AuthService } from './core/services/auth.service';
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('plateforme-securite-routiere');
  private authService = inject(AuthService);
  private router = inject(Router);
  // Force LanguageService instantiation early (loads saved language + applies RTL)
  private languageService = inject(LanguageService);
  showFooter = signal(true);

  constructor() {
    this.updateFooterVisibility(this.router.url);
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed()
      )
      .subscribe((event) => {
        this.updateFooterVisibility((event as NavigationEnd).urlAfterRedirects);
      });
  }

  get isAuthenticated() {
    return this.authService.isAuthenticated;
  }

  private updateFooterVisibility(url: string): void {
    const normalized = url.split('?')[0] || '';
    const hideForBackoffice = normalized.startsWith('/admin') || normalized.startsWith('/formateur');
    const hideForQcmResult = /^\/apprenant\/qcm\/[^/]+\/resultat$/.test(normalized);
    const hidden = hideForBackoffice || hideForQcmResult;
    this.showFooter.set(!hidden);
  }
}

import { Component, HostBinding, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-platform-brand-name',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="logo-text">
      <span class="logo-title">{{ titleKey | translate }}</span>
      <span class="logo-subtitle">{{ subtitleKey | translate }}</span>
    </div>
  `,
  styleUrl: './platform-brand-name.css',
})
export class PlatformBrandName {
  @Input() titleKey = 'FOOTER.BRAND_TITLE';
  @Input() subtitleKey = 'FOOTER.BRAND_SUBTITLE';
  @Input() variant: 'header' | 'footer' | 'auth' = 'header';

  @HostBinding('class')
  get hostClass(): string {
    return `variant-${this.variant}`;
  }
}

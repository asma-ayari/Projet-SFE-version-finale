import { Component, Input } from '@angular/core';
import { PLATFORM_LOGO_ALT, PLATFORM_LOGO_SRC } from '../../core/constants/branding';

@Component({
  selector: 'app-platform-logo',
  standalone: true,
  template: `<img [src]="src" [alt]="alt" class="platform-logo-img" [style.height.px]="height" />`,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
    }

    .platform-logo-img {
      width: auto;
      max-width: 100%;
      object-fit: contain;
      display: block;
    }
  `],
})
export class PlatformLogo {
  @Input() src = PLATFORM_LOGO_SRC;
  @Input() alt = PLATFORM_LOGO_ALT;
  @Input() height = 48;
}

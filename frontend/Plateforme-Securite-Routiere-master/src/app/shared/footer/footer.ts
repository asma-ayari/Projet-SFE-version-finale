import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PlatformLogo } from '../platform-logo/platform-logo';
import { PlatformBrandName } from '../platform-brand-name/platform-brand-name';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink, TranslateModule, PlatformLogo, PlatformBrandName],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  currentYear = new Date().getFullYear();
}

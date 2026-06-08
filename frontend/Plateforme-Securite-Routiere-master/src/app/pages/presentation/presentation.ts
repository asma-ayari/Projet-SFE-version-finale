import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-presentation',
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './presentation.html',
  styleUrl: './presentation.css',
  host: {
    translate: 'no',
    class: 'notranslate'
  }
})
export class Presentation {
  campaignImages = [
    {
      src: 'assets/presentation/act.png',
      titleKey: 'PRESENTATION.CAROUSEL_1_TITLE',
      subtitleKey: 'PRESENTATION.CAROUSEL_1_SUBTITLE'
    },
    {
      src: 'assets/presentation/activ.png',
      titleKey: 'PRESENTATION.CAROUSEL_2_TITLE',
      subtitleKey: 'PRESENTATION.CAROUSEL_2_SUBTITLE'
    },
    {
      src: 'assets/presentation/activite.png',
      titleKey: 'PRESENTATION.CAROUSEL_3_TITLE',
      subtitleKey: 'PRESENTATION.CAROUSEL_3_SUBTITLE'
    }
  ];

  objectives = [
    {
      icon: 'fa-graduation-cap',
      titleKey: 'PRESENTATION.OBJECTIVE_1_TITLE',
      descriptionKey: 'PRESENTATION.OBJECTIVE_1_DESC'
    },
    {
      icon: 'fa-brain',
      titleKey: 'PRESENTATION.OBJECTIVE_2_TITLE',
      descriptionKey: 'PRESENTATION.OBJECTIVE_2_DESC'
    },
    {
      icon: 'fa-chart-bar',
      titleKey: 'PRESENTATION.OBJECTIVE_3_TITLE',
      descriptionKey: 'PRESENTATION.OBJECTIVE_3_DESC'
    },
    {
      icon: 'fa-users',
      titleKey: 'PRESENTATION.OBJECTIVE_4_TITLE',
      descriptionKey: 'PRESENTATION.OBJECTIVE_4_DESC'
    }
  ];
}

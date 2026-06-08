import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  features = [
    {
      icon: 'fa-book-open',
      titleKey: 'HOME.FEATURES.COURSES.TITLE',
      descKey: 'HOME.FEATURES.COURSES.DESC',
      color: 'primary'
    },
    {
      icon: 'fa-clipboard-check',
      titleKey: 'HOME.FEATURES.QCM.TITLE',
      descKey: 'HOME.FEATURES.QCM.DESC',
      color: 'success'
    },
    {
      icon: 'fa-robot',
      titleKey: 'HOME.FEATURES.CHATBOT.TITLE',
      descKey: 'HOME.FEATURES.CHATBOT.DESC',
      color: 'warning'
    },
    {
      icon: 'fa-chart-line',
      titleKey: 'HOME.FEATURES.PROGRESS.TITLE',
      descKey: 'HOME.FEATURES.PROGRESS.DESC',
      color: 'info'
    }
  ];

  statistics = [
    { value: '100+', labelKey: 'HOME.STATS.LEARNERS' },
    { value: '20+', labelKey: 'HOME.STATS.COURSES' },
    { value: '50+', labelKey: 'HOME.STATS.QUESTIONS' },
    { value: '95%', labelKey: 'HOME.STATS.SATISFACTION' }
  ];
}

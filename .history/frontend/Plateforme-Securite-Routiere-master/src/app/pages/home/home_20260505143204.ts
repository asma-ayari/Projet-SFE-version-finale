import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  features = [
    {
      icon: 'fa-book-open',
      title: 'Cours Complètes',
      desc: 'Accédez à des cours structurés sur tous les aspects de la sécurité routière',
      color: 'primary'
    },
    {
      icon: 'fa-clipboard-check',
      title: 'Tests de Connaissance',
      desc: 'Testez vos connaissances avec des questionnaires',
      color: 'success'
    },
    {
      icon: 'fa-robot',
      title: 'Assistant IA',
      desc: 'Posez vos questions et obtenez des réponses instantanées',
      color: 'warning'
    },
    {
      icon: 'fa-chart-line',
      title: 'Suivi de Progression',
      desc: 'Suivez votre progression et vos performances',
      color: 'info'
    }
  ];

  statistics = [
    { value: '100+', label: 'Apprenants' },
    { value: '20+', label: 'Courses' },
    { value: '50+', label: 'Questions' },
    { value: '95%', label: 'Satisfaction' }
  ];
}

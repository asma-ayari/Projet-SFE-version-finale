import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-presentation',
  imports: [CommonModule, RouterLink],
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
      title: 'Campagne de Sensibilisation',
      subtitle: 'Actions terrain et communication visuelle'
    },
    {
      src: 'assets/presentation/activ.png',
      title: 'Prévention et Proximité',
      subtitle: 'Interventions auprès des usagers de la route'
    },
    {
      src: 'assets/presentation/activite.png',
      title: 'Mobilisation Collective',
      subtitle: 'Événements, ateliers et rencontres partenaires'
    }
  ];

  objectives = [
    {
      icon: 'fa-graduation-cap',
      title: 'Formation Interactive',
      description: 'Cours en ligne accessibles 24h/24 avec des supports variés (textes, vidéos, PDF)'
    },
    {
      icon: 'fa-brain',
      title: 'Intelligence Artificielle',
      description: 'Chatbot RAG bilingue pour répondre instantanément à toutes vos questions'
    },
    {
      icon: 'fa-chart-bar',
      title: 'Évaluation Continue',
      description: 'QCM de test de niveau pour mesurer vos progrès et identifier les points à améliorer'
    },
    {
      icon: 'fa-users',
      title: 'Communauté Active',
      description: 'Rejoignez une communauté d\'apprenants motivés par la sécurité routière'
    }
  ];
}

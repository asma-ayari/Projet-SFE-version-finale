import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ChatbotWidgetComponent } from '../../shared/chatbot-widget/chatbot-widget';

interface Course {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  duration: string;
  lessons: number;
  totalPages: number;
  rating: number;
  students: number;
  image?: string;
  instructor: string;
  progress?: number;
}

@Component({
  selector: 'app-cours-list',
  imports: [CommonModule, RouterLink, FormsModule, TranslateModule, ChatbotWidgetComponent],
  templateUrl: './cours-list.html',
  styleUrl: './cours-list.css',
})
export class CoursList {
  searchQuery = signal('');
  selectedCategory = signal('all');
  selectedLevel = signal('all');
  failedImageIds = signal<Set<number>>(new Set());

  categories = [
    { value: 'all', label: 'COURSES.ALL_CATEGORIES' },
    { value: 'conduite', label: 'COURSES.CAT_CONDUITE' },
    { value: 'securite', label: 'COURSES.CAT_SECURITE' },
    { value: 'secours', label: 'COURSES.CAT_SECOURS' }
  ];

  levels = [
    { value: 'all', label: 'COURSES.ALL_LEVELS' },
    { value: 'debutant', label: 'COURSES.LEVEL_BEGINNER' },
    { value: 'intermediaire', label: 'COURSES.LEVEL_INTERMEDIATE' }
  ];

  courses = signal<Course[]>([
    {
      id: 1,
      title: 'Distance d\'arrêt',
      description: 'Comprendre les facteurs qui influencent la distance d\'arrêt et comment l\'anticiper.',
      category: 'conduite',
      level: 'debutant',
      duration: '1h 30min',
      lessons: 6,
      totalPages: 6,
      rating: 4.8,
      students: 1250,
      image: 'distance-arret.png',
      instructor: 'Mohamed Ben Ali',
      progress: 17
    },
    {
      id: 2,
      title: 'Angles morts',
      description: 'Identifier et gérer les zones non visibles autour de votre véhicule.',
      category: 'securite',
      level: 'debutant',
      duration: '1h 15min',
      lessons: 6,
      totalPages: 7,
      rating: 4.7,
      students: 980,
      image: 'angles-mort.png',
      instructor: 'Fatma Trabelsi'
    },
    {
      id: 3,
      title: 'Alcool : les effets',
      description: 'Les effets de l\'alcool sur la conduite et les capacités du conducteur.',
      category: 'securite',
      level: 'debutant',
      duration: '1h 45min',
      lessons: 6,
      totalPages: 5,
      rating: 4.9,
      students: 1100,
      image: 'alccol-effets.png',
      instructor: 'Dr. Karim Sfar'
    },
    {
      id: 4,
      title: 'Adhérence',
      description: 'Maîtriser l\'adhérence du véhicule selon les conditions météorologiques.',
      category: 'conduite',
      level: 'intermediaire',
      duration: '1h 30min',
      lessons: 6,
      totalPages: 6,
      rating: 4.6,
      students: 890,
      image: 'adherence.png',
      instructor: 'Ahmed Gharbi'
    },
    {
      id: 5,
      title: 'Champ visuel',
      description: 'Optimiser votre champ de vision pour une conduite plus sûre.',
      category: 'conduite',
      level: 'debutant',
      duration: '1h 20min',
      lessons: 6,
      totalPages: 6,
      rating: 4.5,
      students: 756,
      image: 'champs-visuel.png',
      instructor: 'Sarra Jebali'
    },
    {
      id: 6,
      title: 'Alcool : les doses',
      description: 'Comprendre les limites légales et les équivalences en alcoolémie.',
      category: 'securite',
      level: 'debutant',
      duration: '1h 15min',
      lessons: 6,
      totalPages: 5,
      rating: 4.7,
      students: 920,
      image: 'alcool-doses.png',
      instructor: 'Dr. Karim Sfar'
    },
    {
      id: 7,
      title: 'Temps de réaction',
      description: 'Facteurs influençant le temps de réaction et comment l\'améliorer.',
      category: 'conduite',
      level: 'intermediaire',
      duration: '1h 40min',
      lessons: 6,
      totalPages: 9,
      rating: 4.8,
      students: 845,
      image: 'temps-reaction.png',
      instructor: 'Mohamed Ben Ali'
    },
    {
      id: 8,
      title: 'Téléphone mobile',
      description: 'Les dangers du téléphone au volant et la réglementation en vigueur.',
      category: 'securite',
      level: 'debutant',
      duration: '1h 10min',
      lessons: 6,
      totalPages: 5,
      rating: 4.6,
      students: 1050,
      image: 'telephone-mobile.png',
      instructor: 'Fatma Trabelsi'
    },
    {
      id: 9,
      title: 'Cannabis : les effets',
      description: 'Impact du cannabis sur les capacités de conduite et risques légaux.',
      category: 'securite',
      level: 'debutant',
      duration: '1h 30min',
      lessons: 6,
      totalPages: 5,
      rating: 4.7,
      students: 780,
      image: 'connabis-effect.png',
      instructor: 'Dr. Karim Sfar'
    },
    {
      id: 10,
      title: 'Ceintures de sécurité',
      description: 'L\'importance de la ceinture et son utilisation correcte pour tous les passagers.',
      category: 'securite',
      level: 'debutant',
      duration: '1h 00min',
      lessons: 6,
      totalPages: 6,
      rating: 4.9,
      students: 1200,
      image: 'ceinture-securite.png',
      instructor: 'Ahmed Gharbi'
    },
    {
      id: 11,
      title: 'Premiers secours',
      description: 'Gestes essentiels pour porter secours en cas d\'accident de la route.',
      category: 'secours',
      level: 'intermediaire',
      duration: '2h 00min',
      lessons: 6,
      totalPages: 7,
      rating: 4.9,
      students: 950,
      image: 'premiers-secours.png',
      instructor: 'Dr. Karim Sfar'
    }
  ]);

  filteredCourses = computed(() => {
    let result = this.courses();

    const query = this.searchQuery().toLowerCase();
    if (query) {
      result = result.filter(c => 
        c.title.toLowerCase().includes(query) || 
        c.description.toLowerCase().includes(query)
      );
    }

    const category = this.selectedCategory();
    if (category !== 'all') {
      result = result.filter(c => c.category === category);
    }

    const level = this.selectedLevel();
    if (level !== 'all') {
      result = result.filter(c => c.level === level);
    }

    return result;
  });

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  onCategoryChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedCategory.set(select.value);
  }

  onLevelChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedLevel.set(select.value);
  }

  getLevelLabel(level: string): string {
    const labels: Record<string, string> = {
      'debutant': 'COURSES.LEVEL_BEGINNER',
      'intermediaire': 'COURSES.LEVEL_INTERMEDIATE',
      'avance': 'COURSES.LEVEL_ADVANCED'
    };
    return labels[level] || level;
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  getCourseImagePath(course: Course): string {
    return course.image ? `assets/cours/${course.image}` : '';
  }

  hasImageError(courseId: number): boolean {
    return this.failedImageIds().has(courseId);
  }

  onImageError(courseId: number): void {
    this.failedImageIds.update((prev) => {
      const next = new Set(prev);
      next.add(courseId);
      return next;
    });
  }
}

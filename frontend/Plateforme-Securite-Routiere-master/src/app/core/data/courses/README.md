# Architecture Modulaire des Cours - Sécurité Routière

## 📁 Structure des Répertoires

```
src/app/core/
├── data/
│   └── courses/                          # 📚 Tous les cours
│       ├── course-1-distance.ts          # Cours 1 : Distance d'arrêt
│       ├── course-2-angles-morts.ts      # Cours 2 : Angles morts
│       ├── course-3-alcool-effets.ts     # Cours 3 : Alcool - Les effets
│       ├── course-4-adherence.ts         # Cours 4 : Adhérence
│       ├── course-5-champ-visuel.ts      # Cours 5 : Champ visuel
│       ├── course-6-alcool-doses.ts      # Cours 6 : Alcool - Les doses
│       ├── course-7-temps-reaction.ts    # Cours 7 : Temps de réaction
│       ├── course-8-telephone.ts         # Cours 8 : Téléphone mobile
│       ├── course-9-cannabis.ts          # Cours 9 : Cannabis - Les effets
│       ├── course-10-ceintures.ts        # Cours 10 : Ceintures de sécurité
│       ├── course-11-premiers-secours.ts # Cours 11 : Premiers secours
│       └── index.ts                      # ⚡ Barrel export de tous les cours
│
└── services/
    └── course-content.service.ts         # 🔧 Service qui importe tous les cours
```

## 🎯 Avantages de cette Architecture

### 1. **Séparation des Responsabilités**
- Chaque cours est dans son propre fichier
- Facile de localiser et modifier un cours spécifique
- Réduction du couplage entre les cours

### 2. **Scalabilité**
- Ajouter un nouveau cours = créer un nouveau fichier
- Pas besoin de modifier le service principal
- Structure claire et prévisible

### 3. **Maintenabilité**
- Fichiers plus petits et faciles à naviguer
- Modifications isolées = moins de risques de bugs
- Code plus lisible et documenté

### 4. **Réutilisabilité**
- Les cours peuvent être importés individuellement
- Possibilité de créer des modules spécialisés
- Facilité de tester chaque cours en isolation

## 📝 Comment Ajouter un Nouveau Cours

### Étape 1 : Créer le fichier du cours

Créer `src/app/core/data/courses/course-12-nouvelle-matiere.ts`

```typescript
import { CourseContent } from '../../../core/services/course-content.service';

export const COURSE_12_NOUVELLE_MATIERE: CourseContent = {
  id: 12,
  title: 'Titre du Cours',
  icon: '🎓',
  category: 'Catégorie',
  duration: '30 min',
  description: 'Description brève du cours',
  lessons: [
    {
      lessonNumber: 1,
      title: 'Titre de la Leçon 1',
      content: `Contenu de la leçon 1...`
    },
    // ... autres leçons
  ]
};
```

### Étape 2 : Ajouter l'export au barrel

Ajouter dans `src/app/core/data/courses/index.ts` :

```typescript
export { COURSE_12_NOUVELLE_MATIERE } from './course-12-nouvelle-matiere';
```

### Étape 3 : Importer dans le service

Ajouter dans `src/app/core/services/course-content.service.ts` :

```typescript
import { COURSE_12_NOUVELLE_MATIERE } from '../data/courses';

// Dans loadCourseContents():
12: COURSE_12_NOUVELLE_MATIERE,
```

## 🔗 Comment les Fichiers se Connectent

```
cours-detail.component.ts
        ↓ injecte
CourseContentService
        ↓ importe depuis
index.ts (barrel export)
        ↓ réexporte
course-X-*.ts (fichiers individuels)
```

## 📤 Exportation Barrel (index.ts)

Le fichier `index.ts` agit comme un point d'entrée unique pour tous les cours :

```typescript
// Les autres fichiers peuvent importer comme ceci:
import { 
  COURSE_1_DISTANCE_ARRET,
  COURSE_2_ANGLES_MORTS,
  // ... etc
} from '../data/courses';

// Au lieu de :
import { COURSE_1_DISTANCE_ARRET } from '../data/courses/course-1-distance';
import { COURSE_2_ANGLES_MORTS } from '../data/courses/course-2-angles-morts';
// ... long et répétitif
```

## 💾 Service - Repository Pattern

Le `CourseContentService` agit comme un repository centralisé :

```typescript
// Charge tous les cours au démarrage
private loadCourseContents(): void {
  const coursesData = {
    1: COURSE_1_DISTANCE_ARRET,
    2: COURSE_2_ANGLES_MORTS,
    // ...
  };
  this.courseContents.set(coursesData);
}

// Fournit un accès unifié
getCourseContent(courseId: number): CourseContent | undefined
getAllCourseContents(): { [key: number]: CourseContent }
```

## 🎓 Interface CourseContent

Tous les cours et leçons suivent la même structure :

```typescript
export interface CourseContent {
  id: number;                          // ID unique du cours
  title: string;                       // Titre du cours
  icon: string;                        // Emoji ou icône
  category: string;                    // Catégorie (Sécurité, Physique...)
  duration: string;                    // Durée estimée
  description: string;                 // Description courte
  lessons: {                           // Leçons du cours
    lessonNumber: number;
    title: string;
    content: string;                   // Support Markdown
  }[];
}
```

## 🚀 Utilisation dans les Composants

```typescript
export class CoursDetail implements OnInit {
  private courseContentService = inject(CourseContentService);
  
  ngOnInit() {
    const courseId = parseInt(id, 10);
    const content = this.courseContentService.getCourseContent(courseId);
    // Afficher la leçon...
  }
}
```

## ✅ Checklist pour la Maintenance

- [ ] Vérifier que chaque cours a son propre fichier
- [ ] Vérifier que le barrel export (index.ts) est à jour
- [ ] Vérifier que le service importe tous les cours
- [ ] Vérifier que l'interface CourseContent est respectée
- [ ] Tester la navigation entre les leçons
- [ ] Vérifier que le formatage HTML fonctionne

## 📚 Fichiers Clés

| Fichier | Rôle | Type |
|---------|------|------|
| `course-*.ts` | Définition des cours | Data |
| `index.ts` | Export centralisé | Barrel |
| `course-content.service.ts` | Gestion des cours | Service |
| `cours-detail.component.ts` | Affichage des cours | Component |
| `cours-detail.html` | Template générique | Template |

---

**Version**: 2.0 (Architecture Modulaire)  
**Date**: 24 Mars 2026  
**État**: ✅ Production Ready

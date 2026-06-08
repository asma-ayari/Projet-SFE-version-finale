# 📊 Architecture Modulaire des Cours - Diagramme

## Structure Hiérarchique

```
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION FRONTEND                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         Composants d'Affichage (Templates)             │   │
│  │                                                          │   │
│  │  ├── cours-detail.component.ts (Component Logic)       │   │
│  │  ├── cours-detail.html (Template Générique)           │   │
│  │  └── cours-detail.css (Styles)                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↓ (injecte)                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         CourseContentService (@Injectable)            │   │
│  │                                                          │   │
│  │  • getCourseContent(id): CourseContent                 │   │
│  │  • getAllCourseContents(): { [k]: CourseContent }      │   │
│  │  • private loadCourseContents()                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↓ (importe)                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │    Barrel Export (index.ts) - Point d'Entrée         │   │
│  │                                                          │   │
│  │    export { COURSE_1_DISTANCE_ARRET } ...             │   │
│  │    export { COURSE_2_ANGLES_MORTS } ...               │   │
│  │    export { COURSE_3_ALCOOL_EFFETS } ...              │   │
│  │    ...                                                   │   │
│  │    export { COURSE_11_PREMIERS_SECOURS } ...           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          ↓ (réexporte)                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │      Fichiers de Cours Modulaires (Data)               │ │
│  │                                                           │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │ 📚 Cours 1: Distance d'arrêt                    │  │ │
│  │  │ (course-1-distance.ts)                          │  │ │
│  │  │ - Leçon 1: Qu'est-ce que distance d'arrêt      │  │ │
│  │  │ - Leçon 2: Limitations de vitesse               │  │ │
│  │  │ - Leçon 3: Quiz                                 │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                                                           │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │ 👁️ Cours 2: Angles morts                        │  │ │
│  │  │ (course-2-angles-morts.ts)                      │  │ │
│  │  │ - Leçon 1: Qu'est-ce qu'un angle mort          │  │ │
│  │  │ - Leçon 2: Comment minimiser les angles        │  │ │
│  │  │ - Leçon 3: Prévention des accidents            │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  │                                                           │ │
│  │  ┌──────────────────────────────────────────────────┐  │ │
│  │  │ ... (9 autres cours)                            │  │ │
│  │  │ course-3-alcool-effets.ts                       │  │ │
│  │  │ course-4-adherence.ts                           │  │ │
│  │  │ course-5-champ-visuel.ts                        │  │ │
│  │  │ course-6-alcool-doses.ts                        │  │ │
│  │  │ course-7-temps-reaction.ts                      │  │ │
│  │  │ course-8-telephone.ts                           │  │ │
│  │  │ course-9-cannabis.ts                            │  │ │
│  │  │ course-10-ceintures.ts                          │  │ │
│  │  │ course-11-premiers-secours.ts                   │  │ │
│  │  └──────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

```

## Flux de Données (Data Flow)

```
Utilisateur clique sur un cours
        ↓
     Route: /apprenant/cours/1
        ↓
  CoursDetail Component (ngOnInit)
        ↓
  injection: CourseContentService
        ↓
  getCourseContent(1)
        ↓
  Cherche dans courseContents signal
        ↓
  Retourne COURSE_1_DISTANCE_ARRET
        ↓
  Component affiche la leçon 1
        ↓
  Template utilise: {{ courseTitle() }} et {{ currentLesson().content }}
        ↓
  Utilisateur clique "Leçon suivante"
        ↓
  currentPage.update() → nextPage()
        ↓
  currentLesson computed se recalcule
        ↓
  Affiche la leçon 2
```

## Avantages de la Séparation

### Avant (Monolithique)
```
course-content.service.ts (870 lignes)
├── Cours 1 (50 lignes)
├── Cours 2 (62 lignes)
├── Cours 3 (67 lignes)
└── ... Cours 11 (mix total = chaos)
```

### Après (Modulaire)
```
data/courses/
├── course-1-distance.ts (50 lignes)
├── course-2-angles-morts.ts (62 lignes)
├── course-3-alcool-effets.ts (67 lignes)
├── ...
├── course-11-premiers-secours.ts (80 lignes)
├── index.ts (12 lignes - barrel export)
└── README.md (documentation)

services/
└── course-content.service.ts (65 lignes - seulement les methodes)
```

## Dépendances et Imports

```
┌─────────────────────────────┐
│  cours-detail.component.ts  │
└────────────┬────────────────┘
             │
    injecte CourseContentService
             │
             ↓
┌─────────────────────────────┐
│ course-content.service.ts   │
└────────────┬────────────────┘
             │
    importe depuis '../data/courses'
             │
             ↓
┌─────────────────────────────┐
│      courses/index.ts       │ (barrel export)
└────────────┬────────────────┘
             │
    réexporte 11 courses depuis:
             │
    ┌────────┬────────┬────────┬─────────────┐
    ↓        ↓        ↓        ↓             ↓
course-1  course-2  course-3 ...         course-11
course-N.ts (chaque fichier = 1 course)
```

## Organisation des Dossiers

```
src/app/
├── core/
│   ├── data/
│   │   └── courses/                 ← 📍 LES COURS
│   │       ├── course-1-distance.ts
│   │       ├── course-2-angles-morts.ts
│   │       ├── ... (9 autres)
│   │       ├── course-11-premiers-secours.ts
│   │       ├── index.ts
│   │       └── README.md
│   │
│   └── services/
│       ├── course-content.service.ts  ← Importe depuis data/courses
│       ├── auth.service.ts
│       └── ...
│
├── apprenant/
│   ├── cours-detail/
│   │   ├── cours-detail.component.ts   ← Injecte CourseContentService
│   │   ├── cours-detail.html
│   │   └── cours-detail.css
│   ├── cours-list/
│   ├── dashboard/
│   └── ...
│
└── ...
```

## Avantages Détaillés

### ✅ Séparation des Préoccupations
- **Avant**: 1 fichier service massive
- **Après**: 1 fichier par cours + 1 service lean + 1 barrel export

### ✅ Facilité de Maintenance
- Pour modifier Cours 1: `course-1-distance.ts`
- Pas besoin de toucher aux 10 autres cours

### ✅ Testabilité
```typescript
// Test facile d'un seul cours
import { COURSE_1_DISTANCE_ARRET } from './course-1-distance';

test('course 1 has 3 lessons', () => {
  expect(COURSE_1_DISTANCE_ARRET.lessons.length).toBe(3);
});
```

### ✅ Scalabilité
```
Ajouter Cours 12?
1. Créer course-12-new.ts
2. Ajouter export dans index.ts
3. Ajouter import dans service
Done! ✅
```

### ✅ Réutilisabilité
```typescript
// Peut importer un seul cours n'importe où
import { COURSE_1_DISTANCE_ARRET } from '../data/courses';

// Ou tous les cours
import {
  COURSE_1_DISTANCE_ARRET,
  COURSE_2_ANGLES_MORTS,
  // ...
} from '../data/courses';
```

## Patterns Utilisés

1. **Barrel Export Pattern** (`index.ts`)
   - Centralise les exports
   - Simplifie les imports

2. **Repository Pattern** (`CourseContentService`)
   - Accès unifié aux données
   - Abstrait la provenance des données

3. **Modular/Modularization**
   - Chaque entité dans son propre fichier
   - Décomposition logique claire

4. **Signals Pattern** (Angular 17+)
   - Réactivité avec `signal()`
   - Computed values avec `computed()`

---

**État**: ✅ Architecture Moderne et Scalable
**Optimisé pour**: Maintenance, Croissance, Collaboration

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { signal, computed } from '@angular/core';
import {
  COURSE_1_DISTANCE_ARRET,
  COURSE_2_ANGLES_MORTS,
  COURSE_3_ALCOOL_EFFETS,
  COURSE_4_ADHERENCE,
  COURSE_5_CHAMP_VISUEL,
  COURSE_6_ALCOOL_DOSES,
  COURSE_7_TEMPS_REACTION,
  COURSE_8_TELEPHONE_MOBILE,
  COURSE_9_CANNABIS_EFFETS,
  COURSE_10_CEINTURES_SECURITE,
  COURSE_11_PREMIERS_SECOURS
} from '../data/courses';

export interface CourseContent {
  id: number;
  title: string;
  icon: string;
  category: string;
  duration: string;
  description: string;
  totalPages: number;
  lessons: {
    lessonNumber: number;
    title: string;
    content: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class CourseContentService {
  private courseContents = signal<{ [key: number]: CourseContent }>({});
  private contentLoaded = signal<boolean>(false);

  constructor(private http: HttpClient) {
    this.loadCourseContents();
  }

  private loadCourseContents(): void {
    // Mapping des 11 cours depuis des fichiers modularisés
    // Chaque cours est maintenant défini dans son propre fichier
    const coursesData: { [key: number]: CourseContent } = {
      1: COURSE_1_DISTANCE_ARRET,
      2: COURSE_2_ANGLES_MORTS,
      3: COURSE_3_ALCOOL_EFFETS,
      4: COURSE_4_ADHERENCE,
      5: COURSE_5_CHAMP_VISUEL,
      6: COURSE_6_ALCOOL_DOSES,
      7: COURSE_7_TEMPS_REACTION,
      8: COURSE_8_TELEPHONE_MOBILE,
      9: COURSE_9_CANNABIS_EFFETS,
      10: COURSE_10_CEINTURES_SECURITE,
      11: COURSE_11_PREMIERS_SECOURS
    };

    this.courseContents.set(coursesData);
    this.contentLoaded.set(true);
  }

  getCourseContent(courseId: number): CourseContent | undefined {
    return this.courseContents()[courseId];
  }

  getAllCourseContents(): { [key: number]: CourseContent } {
    return this.courseContents();
  }
}

/**
 * i18n Configuration
 * Configuration centralisée pour l'internationalisation (FR/AR)
 */

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  fontFamily: string;
  dateFormat: string;
  numberFormat: string;
  currencyCode: string;
}

export const LANGUAGES: Record<string, LanguageConfig> = {
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    dateFormat: 'dd/MM/yyyy',
    numberFormat: 'de-DE', // Uses comma as decimal separator
    currencyCode: 'EUR'
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
    fontFamily: "'Droid Arabic Naskh', 'Arabic Typesetting', 'Arial', sans-serif",
    dateFormat: 'dd/MM/yyyy',
    numberFormat: 'ar-SA',
    currencyCode: 'TND' // Tunisian Dinar
  }
};

/**
 * Clés de traduction disponibles
 * Utiliser pour IntelliSense dans l'IDE
 */
export const TRANSLATION_KEYS = {
  // Navigation
  NAV: {
    HOME: 'NAV.HOME',
    COURSES: 'NAV.COURSES',
    QCM: 'NAV.QCM',
    CHATBOT: 'NAV.CHATBOT',
    LOGIN: 'NAV.LOGIN',
    REGISTER: 'NAV.REGISTER',
    DASHBOARD: 'NAV.DASHBOARD',
    LOGOUT: 'NAV.LOGOUT',
  },
  
  // Admin Space
  ADMIN: {
    TITLE: 'ADMIN.TITLE',
    DASHBOARD: {
      TITLE: 'ADMIN.DASHBOARD.OVERVIEW_TITLE',
      METRICS: {
        TOTAL_USERS: 'ADMIN.DASHBOARD.METRICS.TOTAL_USERS',
        COURSES_PUBLISHED: 'ADMIN.DASHBOARD.METRICS.COURSES_PUBLISHED',
      }
    },
    USERS: {
      TITLE: 'ADMIN.USERS.TITLE',
      ADD_USER: 'ADMIN.USERS.ADD_USER',
      EDIT_USER: 'ADMIN.USERS.EDIT_USER',
      DELETE_USER: 'ADMIN.USERS.DELETE_USER',
    },
    COURSES: {
      TITLE: 'ADMIN.COURSES.TITLE',
      ADD_COURSE: 'ADMIN.COURSES.ADD_COURSE',
      EDIT: 'ADMIN.COURSES.EDIT',
      PUBLISH: 'ADMIN.COURSES.PUBLISH',
      DELETE: 'ADMIN.COURSES.DELETE',
    },
    QCM: {
      TITLE: 'ADMIN.QCM.TITLE',
      ADD_QCM: 'ADMIN.QCM.ADD_QCM',
      EDIT: 'ADMIN.QCM.EDIT',
      PUBLISH: 'ADMIN.QCM.PUBLISH',
      DELETE: 'ADMIN.QCM.DELETE',
    },
  },

  // Learner Space
  APPRENANT: {
    TITLE: 'APPRENANT.TITLE',
    DASHBOARD: {
      WELCOME: 'APPRENANT.DASHBOARD.WELCOME',
      STATISTICS: {
        TOTAL_HOURS: 'APPRENANT.DASHBOARD.STATISTICS.TOTAL_HOURS',
        COURSES_COMPLETED: 'APPRENANT.DASHBOARD.STATISTICS.COURSES_COMPLETED',
      }
    },
    COURSES: {
      TITLE: 'APPRENANT.COURSES.TITLE',
      START: 'APPRENANT.COURSES.COURSE_CARD.START',
      RESUME: 'APPRENANT.COURSES.COURSE_CARD.RESUME',
      VIEW_COURSE: 'APPRENANT.COURSES.VIEW_COURSE',
    },
    QCM: {
      TITLE: 'APPRENANT.QCM.TITLE',
      START_TEST: 'APPRENANT.QCM.START_TEST',
      VIEW_RESULTS: 'APPRENANT.QCM.VIEW_RESULTS',
      DOWNLOAD_CERTIFICATE: 'APPRENANT.QCM.DOWNLOAD_CERTIFICATE',
    },
    PROFILE: {
      TITLE: 'APPRENANT.PROFILE.TITLE',
      EDIT: 'APPRENANT.PROFILE.EDIT',
      SAVE: 'APPRENANT.PROFILE.SAVE',
    },
  },

  // Trainer Space
  FORMATEUR: {
    TITLE: 'FORMATEUR.TITLE',
    DASHBOARD: {
      OVERVIEW: 'FORMATEUR.DASHBOARD.OVERVIEW',
      COURSES_CREATED: 'FORMATEUR.DASHBOARD.COURSES_CREATED',
      TOTAL_STUDENTS: 'FORMATEUR.DASHBOARD.TOTAL_STUDENTS',
    },
    COURSES: {
      TITLE: 'FORMATEUR.COURSES.TITLE',
      CREATE_COURSE: 'FORMATEUR.COURSES.CREATE_COURSE',
      EDIT: 'FORMATEUR.COURSES.COURSE_CARD.EDIT',
      PUBLISH: 'FORMATEUR.COURSES.COURSE_CARD.PUBLISH',
      STATISTICS: 'FORMATEUR.COURSES.COURSE_CARD.STATISTICS',
    },
    QCM: {
      TITLE: 'FORMATEUR.QCM.TITLE',
      CREATE_QCM: 'FORMATEUR.QCM.CREATE_QCM',
      EDIT: 'FORMATEUR.QCM.QCM_CARD.EDIT',
      PUBLISH: 'FORMATEUR.QCM.QCM_CARD.PUBLISH',
    },
    STUDENTS: {
      TITLE: 'FORMATEUR.STUDENTS.TITLE',
      CONTACT: 'FORMATEUR.STUDENTS.STUDENT_PROFILE.CONTACT',
      SEND_MESSAGE: 'FORMATEUR.STUDENTS.STUDENT_PROFILE.SEND_MESSAGE',
    },
  },

  // QCM Interface
  QCM_INTERFACE: {
    START_TEST: 'QCM_INTERFACE.START_TEST',
    NEXT_QUESTION: 'QCM_INTERFACE.NEXT_QUESTION',
    PREVIOUS_QUESTION: 'QCM_INTERFACE.PREVIOUS_QUESTION',
    SUBMIT_TEST: 'QCM_INTERFACE.SUBMIT_TEST',
    CONGRATULATIONS: 'QCM_INTERFACE.CONGRATULATIONS',
    TRY_AGAIN: 'QCM_INTERFACE.TRY_AGAIN',
  },

  // Notifications
  NOTIFICATIONS: {
    SUCCESS: 'NOTIFICATIONS_SYSTEM.SUCCESS',
    ERROR: 'NOTIFICATIONS_SYSTEM.ERROR',
    WARNING: 'NOTIFICATIONS_SYSTEM.WARNING',
    INFO: 'NOTIFICATIONS_SYSTEM.INFO',
    COURSE_CREATED: 'NOTIFICATIONS_SYSTEM.COURSE_CREATED',
    QCM_CREATED: 'NOTIFICATIONS_SYSTEM.QCM_CREATED',
    USER_CREATED: 'NOTIFICATIONS_SYSTEM.USER_CREATED',
  },

  // Common
  COMMON: {
    LOADING: 'COMMON.LOADING',
    ERROR: 'COMMON.ERROR',
    SAVE: 'COMMON.SAVE',
    CANCEL: 'COMMON.CANCEL',
    DELETE: 'COMMON.DELETE',
    EDIT: 'COMMON.EDIT',
    VIEW: 'COMMON.VIEW',
    BACK: 'COMMON.BACK',
    NEXT: 'COMMON.NEXT',
    PREVIOUS: 'COMMON.PREVIOUS',
    YES: 'COMMON.YES',
    NO: 'COMMON.NO',
    SEARCH: 'COMMON.SEARCH',
    FILTER: 'COMMON.FILTER',
    SORT: 'COMMON.SORT',
  },

  // Errors
  ERRORS: {
    ERROR_404: 'ERRORS.ERROR_404',
    ERROR_500: 'ERRORS.ERROR_500',
    NOT_FOUND: 'ERRORS.ERROR_404',
    SERVER_ERROR: 'ERRORS.ERROR_500',
  },
};

/**
 * Alias pour accès facile
 */
export const i18n = TRANSLATION_KEYS;

/**
 * Fonctions utilitaires
 */
export const I18nUtils = {
  /**
   * Obtient la configuration d'une langue
   */
  getLanguageConfig(lang: string): LanguageConfig | undefined {
    return LANGUAGES[lang.toLowerCase()];
  },

  /**
   * Liste les langues disponibles
   */
  getAvailableLanguages(): LanguageConfig[] {
    return Object.values(LANGUAGES);
  },

  /**
   * Vérifie si la langue est RTL
   */
  isRTL(lang: string): boolean {
    return this.getLanguageConfig(lang)?.direction === 'rtl';
  },

  /**
   * Obtient la famille de polices pour une langue
   */
  getFontFamily(lang: string): string {
    return this.getLanguageConfig(lang)?.fontFamily || "'Segoe UI', sans-serif";
  },

  /**
   * Obtient le format de date pour une langue
   */
  getDateFormat(lang: string): string {
    return this.getLanguageConfig(lang)?.dateFormat || 'dd/MM/yyyy';
  },
};

/**
 * Constantes de direction
 */
export const DIRECTION = {
  LTR: 'ltr',
  RTL: 'rtl',
};

/**
 * Locales pour les dates et nombres
 */
export const LOCALES = {
  FR: 'fr-FR',
  AR: 'ar-SA',
};

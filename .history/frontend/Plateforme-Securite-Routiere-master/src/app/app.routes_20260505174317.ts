import { Routes } from '@angular/router';
import { authGuard, publicGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  // Public Pages
  {
    path: '',
    canActivate: [publicGuard],
    loadComponent: () => import('./pages/home/home').then(m => m.Home)
  },
  {
    path: 'presentation',
    loadComponent: () => import('./pages/presentation/presentation').then(m => m.Presentation)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then(m => m.Contact)
  },

  // Auth Routes
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login').then(m => m.Login)
      },
      {
        path: 'register',
        loadComponent: () => import('./auth/register/register').then(m => m.Register)
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./auth/forgot-password/forgot-password').then(m => m.ForgotPassword)
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./auth/reset-password/reset-password').then(m => m.ResetPassword)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },

  // Admin Routes
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadComponent: () => import('./admin/admin-layout/admin-layout').then(m => m.AdminLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./admin/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'profile',
        loadComponent: () => import('./admin/admin-profile/admin-profile').then(m => m.AdminProfile)
      },
      {
        path: 'users',
        loadComponent: () => import('./admin/users-management/users-management').then(m => m.UsersManagement)
      },
      {
        path: 'qcm',
        loadComponent: () => import('./admin/qcm-management/qcm-management').then(m => m.QcmManagement)
      },
      {
        path: 'qcm/categories',
        loadComponent: () => import('./admin/qcm-categories/qcm-categories').then(m => m.QcmCategories)
      },
      {
        path: 'qcm/create',
        loadComponent: () => import('./admin/qcm-create/qcm-create').then(m => m.QcmCreate)
      },
      {
        path: 'qcm/edit/:id',
        loadComponent: () => import('./admin/qcm-create/qcm-create').then(m => m.QcmCreate)
      },
      {
        path: 'documents',
        loadComponent: () => import('./admin/documents-management/documents-management').then(m => m.DocumentsManagement)
      },
      {
        path: 'chatbot-training',
        loadComponent: () => import('./admin/chatbot-training/chatbot-training').then(m => m.ChatbotTraining)
      },
      {
        path: 'statistics',
        loadComponent: () => import('./admin/statistics/statistics').then(m => m.Statistics)
      }
    ]
  },

  // Apprenant Routes - Protégées par guard de rôle
  {
    path: 'apprenant',
    canActivate: [authGuard, roleGuard(['apprenant', 'formateur'])],
    children: [
      {
        path: '',
        loadComponent: () => import('./apprenant/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./apprenant/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'cours',
        loadComponent: () => import('./apprenant/cours-list/cours-list').then(m => m.CoursList)
      },
      {
        path: 'cours/:id',
        loadComponent: () => import('./apprenant/cours-detail/cours-detail').then(m => m.CoursDetail)
      },
      {
        path: 'qcm',
        loadComponent: () => import('./apprenant/qcm-list/qcm-list').then(m => m.QcmList)
      },
      {
        path: 'qcm/generate',
        loadComponent: () => import('./apprenant/qcm-generate/qcm-generate').then(m => m.QcmGenerate)
      },
      {
        path: 'qcm/:id',
        loadComponent: () => import('./apprenant/qcm-test/qcm-test').then(m => m.QcmTest)
      },
      {
        path: 'qcm/:id/resultat',
        loadComponent: () => import('./apprenant/qcm-resultat/qcm-resultat').then(m => m.QcmResultat)
      },
      {
        path: 'qcm-resultat',
        loadComponent: () => import('./apprenant/qcm-resultat/qcm-resultat').then(m => m.QcmResultat)
      },
      {
        path: 'videos',
        loadComponent: () => import('./apprenant/videos-list/videos-list').then(m => m.VideosList)
      },
      {
        path: 'chatbot',
        loadComponent: () => import('./apprenant/chatbot/chatbot').then(m => m.Chatbot)
      },
      {
        path: 'profile',
        loadComponent: () => import('./apprenant/profile/profile').then(m => m.Profile)
      }
    ]
  },

  // Formateur Routes - Protégées par guard d'authentification et de rôle
  {
    path: 'formateur',
    canActivate: [authGuard, roleGuard(['formateur'])],
    children: [
      {
        path: '',
        loadComponent: () => import('./formateur/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./formateur/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'cours',
        loadComponent: () => import('./formateur/cours-manage/cours-manage').then(m => m.CoursManage)
      },
      {
        path: 'cours/create',
        loadComponent: () => import('./formateur/cours-create/cours-create').then(m => m.CoursCreate)
      },
      {
        path: 'cours/:id/voir',
        loadComponent: () => import('./apprenant/cours-detail/cours-detail').then(m => m.CoursDetail)
      },
      {
        path: 'cours/:id/modifier',
        loadComponent: () => import('./formateur/cours-edit/cours-edit').then(m => m.CoursEdit)
      },
      {
        path: 'videos',
        loadComponent: () => import('./formateur/video-upload/video-upload').then(m => m.VideoUpload)
      },
      {
        path: 'videos-manage',
        loadComponent: () => import('./formateur/video-manage/video-manage').then(m => m.VideoManage)
      },
      {
        path: 'profile',
        loadComponent: () => import('./apprenant/profile/profile').then(m => m.Profile)
      }
    ]
  },

  // Fallback
  {
    path: '**',
    redirectTo: ''
  }
];

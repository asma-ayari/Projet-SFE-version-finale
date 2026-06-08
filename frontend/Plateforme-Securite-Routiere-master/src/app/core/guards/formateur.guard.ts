import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Guard qui vérifie que l'utilisateur est un formateur
 * Utilisé pour protéger les routes réservées aux formateurs uniquement
 */
export const formateurGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUser();
  
  if (!currentUser) {
    console.error('❌ Formateur Guard: Utilisateur non authentifié');
    router.navigate(['/auth/login']);
    return false;
  }

  if (currentUser.role !== 'formateur') {
    console.error(`❌ Formateur Guard: Accès refusé pour le rôle '${currentUser.role}'`);
    // Rediriger vers le dashboard approprié selon le rôle
    switch (currentUser.role) {
      case 'admin':
        router.navigate(['/admin/dashboard']);
        break;
      case 'apprenant':
        router.navigate(['/apprenant/dashboard']);
        break;
      default:
        router.navigate(['/']);
    }
    return false;
  }

  console.log('✅ Formateur Guard: Accès autorisé pour formateur');
  return true;
};

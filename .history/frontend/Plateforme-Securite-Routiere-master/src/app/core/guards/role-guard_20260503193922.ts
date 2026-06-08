import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Guard qui vérifie le rôle de l'utilisateur
 * Utilisage: canActivate: [roleGuard(['apprenant', 'formateur', 'admin'])]
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentUser = authService.currentUser();
    if (!currentUser) {
      router.navigate(['/auth/login']);
      return false;
    }

    if (
      state.url === '/apprenant/cours' &&
      currentUser.role?.toLowerCase().trim() === 'formateur'
    ) {
      router.navigate(['/formateur/cours']);
      return false;
    }

    // Déboguer le rôle reçu
    console.log('🔍 Role Guard Debug:', {
      'rôle reçu': currentUser.role,
      'type': typeof currentUser.role,
      'rôles attendus': allowedRoles
    });

    // ✅ Utiliser uniquement currentUser.role (UserResponse n'a que ce champ)
    const role = currentUser.role?.toLowerCase().trim() || '';
    
    // Vérifier si le rôle correspond
    const isAuthorized = allowedRoles.some(allowedRole => {
      const normalizedAllowed = allowedRole.toLowerCase().trim();
      // Correspondance exacte simple
      return role === normalizedAllowed;
    });

    if (isAuthorized) {
      console.log('✅ Accès autorisé pour le rôle:', currentUser.role);
      return true;
    }

    console.error(`❌ Accès refusé: utilisateur avec rôle '${currentUser.role}' ne peut pas accéder à cette ressource`);
    console.log(`   Rôles autorisés: ${allowedRoles.join(', ')}`);
    
    // Rediriger vers le dashboard approprié selon le rôle
    if (role === 'admin') {
      router.navigate(['/admin/dashboard']);
    } else if (role === 'formateur') {
      router.navigate(['/formateur/dashboard']);
    } else {
      router.navigate(['/apprenant/dashboard']);
    }
    return false;
  };
};

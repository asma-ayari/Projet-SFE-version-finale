import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  /* ─── Liste des QCM publiés ─── */
  {
    path: 'qcm',
    loadComponent: () => import('./qcm-list/qcm-list.component').then(m => m.QcmListComponent)
  },

  /* ─── Configuration & génération de QCM ─── */
  {
    path: 'qcm-generate',
    loadComponent: () => import('./qcm-generate/qcm-generate.component').then(m => m.QcmGenerateComponent)
  },

  /* ─── Passage du QCM question par question ─── */
  {
    path: 'qcm-session/:id',
    loadComponent: () => import('./qcm-session/qcm-session.component').then(m => m.QcmSessionComponent)
  },

  /* ─── Résultats d'un QCM ─── */
  {
    path: 'qcm-resultat/:id',
    loadComponent: () => import('./qcm-resultat/qcm-resultat').then(m => m.QcmResultat)
  },

  /* ─── Redirection par défaut ─── */
  {
    path: '',
    redirectTo: 'qcm',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ApprenantRoutingModule { }
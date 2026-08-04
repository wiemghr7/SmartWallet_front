import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AdminUserService, UtilisateurAdmin } from '../../../services/admin-user';

@Component({
  selector: 'app-admin-users',
  imports: [],
  templateUrl: './admin-users.html',
  styleUrl: './admin-users.css',
})
export class AdminUsers implements OnInit {
  utilisateurs: UtilisateurAdmin[] = [];
  erreur = '';

  confirmationOuverte = false;
  userCible: UtilisateurAdmin | null = null;

  constructor(
    private service: AdminUserService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.charger();
  }

  charger() {
    this.service.lister().subscribe({
      next: (data) => {
        this.utilisateurs = data;
        this.cd.detectChanges();
      },
      error: () => {
        this.erreur = 'Erreur lors du chargement';
        this.cd.detectChanges();
      },
    });
  }

  actifs(): number {
    return this.utilisateurs.filter((u) => u.estActif).length;
  }

  demanderBascule(user: UtilisateurAdmin) {
    this.userCible = user;
    this.confirmationOuverte = true;
    this.cd.detectChanges();
  }

  annuler() {
    this.confirmationOuverte = false;
    this.userCible = null;
    this.cd.detectChanges();
  }

  confirmer() {
    if (!this.userCible) return;
    this.service.basculerStatut(this.userCible.id).subscribe({
      next: () => {
        this.confirmationOuverte = false;
        this.userCible = null;
        this.charger();
      },
      error: () => {
        this.confirmationOuverte = false;
        this.cd.detectChanges();
      },
    });
  }
}

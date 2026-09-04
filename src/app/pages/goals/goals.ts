import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ObjectifService, Objectif } from '../../services/objectif';

@Component({
  selector: 'app-goals',
  imports: [],
  templateUrl: './goals.html',
  styleUrl: './goals.css',
})
export class Goals implements OnInit {
  objectifs: Objectif[] = [];
  erreur = '';
  chargement = false;

  modaleOuverte = false;
  idEnEdition: number | null = null;

  confirmationOuverte = false;
  idASupprimer: number | null = null;

  // Gestion objectif expiré
  modaleExpireOuverte = false;
  objectifExpire: Objectif | null = null;

  constructor(
    private service: ObjectifService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.charger();
  }

  charger() {
    this.service.lister().subscribe({
      next: (data) => {
        this.objectifs = data;
        this.cd.detectChanges();
      },
      error: () => {
        this.erreur = 'Erreur lors du chargement';
        this.cd.detectChanges();
      },
    });
  }
  objectifsActifs(): Objectif[] {
    return this.objectifs.filter((o) => !o.atteint);
  }

  objectifsAtteints(): Objectif[] {
    return this.objectifs.filter((o) => o.atteint);
  }
  pourcentage(o: Objectif): number {
    if (!o.montantCible || o.montantCible === 0) return 0;
    return Math.min(100, Math.round((o.montantActuel / o.montantCible) * 100));
  }

  reste(o: Objectif): number {
    return Math.max(0, o.montantCible - o.montantActuel);
  }

  ouvrirAjout() {
    this.idEnEdition = null;
    this.erreur = '';
    this.chargement = false;
    this.modaleOuverte = true;
    this.cd.detectChanges();
  }

  editer(o: Objectif) {
    this.idEnEdition = o.id;
    this.erreur = '';
    this.chargement = false;
    this.modaleOuverte = true;
    this.cd.detectChanges();
  }

  fermerModale() {
    this.modaleOuverte = false;
    this.idEnEdition = null;
    this.erreur = '';
    this.cd.detectChanges();
  }

  valider(nom: string, cible: string, dateLimite: string) {
    this.erreur = '';

    if (!nom || !nom.trim()) {
      this.erreur = "Le nom de l'objectif est obligatoire";
      this.cd.detectChanges();
      return;
    }
    if (!cible || parseFloat(cible) <= 0) {
      this.erreur = 'Le montant cible doit être supérieur à 0';
      this.cd.detectChanges();
      return;
    }

    this.chargement = true;

    const donnees = {
      nom: nom.trim(),
      montantCible: parseFloat(cible),
      dateLimite: dateLimite || null,
    };

    const appel = this.idEnEdition
      ? this.service.modifier(this.idEnEdition, donnees)
      : this.service.creer(donnees);

    appel.subscribe({
      next: () => {
        this.chargement = false;
        this.fermerModale();
        this.charger();
      },
      error: (err) => {
        this.chargement = false;
        this.erreur = err?.error?.message || 'Erreur';
        this.cd.detectChanges();
      },
    });
  }

  // ---- Suppression ----
  demanderSuppression(id: number) {
    this.idASupprimer = id;
    this.confirmationOuverte = true;
    this.cd.detectChanges();
  }

  annulerSuppression() {
    this.confirmationOuverte = false;
    this.idASupprimer = null;
    this.cd.detectChanges();
  }

  confirmerSuppression() {
    if (this.idASupprimer === null) return;
    this.service.supprimer(this.idASupprimer).subscribe({
      next: () => {
        this.confirmationOuverte = false;
        this.idASupprimer = null;
        this.charger();
      },
      error: () => {
        this.confirmationOuverte = false;
        this.cd.detectChanges();
      },
    });
  }

  // ---- Objectif expiré ----
  ouvrirExpire(o: Objectif) {
    this.objectifExpire = o;
    this.modaleExpireOuverte = true;
    this.cd.detectChanges();
  }

  fermerExpire() {
    this.modaleExpireOuverte = false;
    this.objectifExpire = null;
    this.cd.detectChanges();
  }

  // Prolonger : ouvre le modale d'édition pour choisir une nouvelle date
  prolongerObjectif() {
    if (!this.objectifExpire) return;
    const obj = this.objectifExpire;
    this.fermerExpire();
    this.editer(obj);
  }

  // Ne pas prolonger = supprimer l'objectif (rend l'épargne)
  supprimerExpire() {
    if (!this.objectifExpire) return;
    this.service.supprimer(this.objectifExpire.id).subscribe({
      next: () => {
        this.fermerExpire();
        this.charger();
      },
      error: () => {
        this.fermerExpire();
        this.cd.detectChanges();
      },
    });
  }

  objectifEnEdition(): Objectif | undefined {
    return this.objectifs.find((o) => o.id === this.idEnEdition);
  }
}

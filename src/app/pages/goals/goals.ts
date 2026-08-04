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

  pourcentage(o: Objectif): number {
    if (!o.montantCible || o.montantCible === 0) return 0;
    return Math.min(100, Math.round((o.montantActuel / o.montantCible) * 100));
  }

  atteint(o: Objectif): boolean {
    return o.montantActuel >= o.montantCible;
  }

  reste(o: Objectif): number {
    return Math.max(0, o.montantCible - o.montantActuel);
  }

  ouvrirAjout() {
    this.idEnEdition = null;
    this.erreur = '';
    this.modaleOuverte = true;
    this.cd.detectChanges();
  }

  editer(o: Objectif) {
    this.idEnEdition = o.id;
    this.erreur = '';
    this.modaleOuverte = true;
    this.cd.detectChanges();
  }

  fermerModale() {
    this.modaleOuverte = false;
    this.idEnEdition = null;
    this.erreur = '';
    this.cd.detectChanges();
  }

  valider(nom: string, cible: string, actuel: string, dateLimite: string) {
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
    const montantActuel = actuel ? parseFloat(actuel) : 0;
    if (montantActuel < 0) {
      this.erreur = 'Le montant actuel doit être positif';
      this.cd.detectChanges();
      return;
    }

    this.chargement = true;

    const donnees = {
      nom: nom.trim(),
      montantCible: parseFloat(cible),
      montantActuel: montantActuel,
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

  objectifEnEdition(): Objectif | undefined {
    return this.objectifs.find((o) => o.id === this.idEnEdition);
  }
}

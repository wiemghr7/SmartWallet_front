import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AdminCategorieService, Categorie } from '../../../services/admin-categorie';

@Component({
  selector: 'app-admin-categories',
  imports: [],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.css',
})
export class AdminCategories implements OnInit {
  categories: Categorie[] = [];
  erreur = '';
  chargement = false;

  modaleOuverte = false;
  idEnEdition: number | null = null;

  confirmationOuverte = false;
  idASupprimer: number | null = null;

  constructor(
    private service: AdminCategorieService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.charger();
  }

  charger() {
    this.service.lister().subscribe({
      next: (data) => {
        this.categories = data;
        this.cd.detectChanges();
      },
      error: () => {
        this.erreur = 'Erreur lors du chargement';
        this.cd.detectChanges();
      },
    });
  }

  ouvrirAjout() {
    this.idEnEdition = null;
    this.erreur = '';
    this.modaleOuverte = true;
    this.cd.detectChanges();
  }

  editer(cat: Categorie) {
    this.idEnEdition = cat.id;
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

  valider(nom: string, type: string) {
    this.erreur = '';

    if (!nom || !nom.trim()) {
      this.erreur = 'Le nom est obligatoire';
      this.cd.detectChanges();
      return;
    }
    if (!type) {
      this.erreur = 'Choisissez le type (dépense ou revenu)';
      this.cd.detectChanges();
      return;
    }

    this.chargement = true;

    const donnees = { nom: nom.trim(), type: type, icone: 'bi-tag', couleur: '#4a86bd' };

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
        this.erreur = 'Erreur lors de la suppression';
        this.confirmationOuverte = false;
        this.cd.detectChanges();
      },
    });
  }

  categorieEnEdition(): Categorie | undefined {
    return this.categories.find((c) => c.id === this.idEnEdition);
  }
}

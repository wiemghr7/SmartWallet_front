import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BudgetService, Budget } from '../../services/budget';
import { CategorieService, Categorie } from '../../services/categorie';

@Component({
  selector: 'app-budgets',
  imports: [],
  templateUrl: './budgets.html',
  styleUrl: './budgets.css',
})
export class Budgets implements OnInit {
  budgets: Budget[] = [];
  categoriesDepense: Categorie[] = [];
  erreur = '';
  chargement = false;

  modaleOuverte = false;
  idEnEdition: number | null = null;
  categorieChoisieId: number | null = null;

  confirmationOuverte = false;
  idASupprimer: number | null = null;

  moisActuel = '';

  constructor(
    private budgetService: BudgetService,
    private categorieService: CategorieService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const maintenant = new Date();
    this.moisActuel = `${maintenant.getFullYear()}-${String(maintenant.getMonth() + 1).padStart(2, '0')}`;
    this.charger();
    this.chargerCategories();
  }

  charger() {
    this.budgetService.lister().subscribe({
      next: (data) => {
        this.budgets = data;
        this.cd.detectChanges();
      },
      error: () => {
        this.erreur = 'Erreur lors du chargement';
        this.cd.detectChanges();
      },
    });
  }

  chargerCategories() {
    this.categorieService.listerParType('DEPENSE').subscribe({
      next: (data) => {
        this.categoriesDepense = data;
        this.cd.detectChanges();
      },
      error: () => this.cd.detectChanges(),
    });
  }

  pourcentage(b: Budget): number {
    if (!b.limiteMensuelle || b.limiteMensuelle === 0) return 0;
    return Math.min(100, Math.round((b.utilisationActuelle / b.limiteMensuelle) * 100));
  }
  niveau(b: Budget): string {
    const p = this.pourcentage(b);
    if (this.depasse(b) || p > 80) return 'danger'; // rouge
    if (p >= 50) return 'moyen'; // orange
    return 'ok'; // vert
  }
  depasse(b: Budget): boolean {
    return b.utilisationActuelle > b.limiteMensuelle;
  }

  reste(b: Budget): number {
    return b.limiteMensuelle - b.utilisationActuelle;
  }

  ouvrirAjout() {
    this.idEnEdition = null;
    this.categorieChoisieId = null;
    this.erreur = '';
    this.modaleOuverte = true;
    this.cd.detectChanges();
  }

  editer(b: Budget) {
    this.idEnEdition = b.id;
    this.categorieChoisieId = b.categorie?.id || null;
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

  choisirCategorie(id: number) {
    this.categorieChoisieId = id;
    this.cd.detectChanges();
  }

  valider(limite: string) {
    this.erreur = '';

    if (!limite || parseFloat(limite) <= 0) {
      this.erreur = 'La limite doit être supérieure à 0';
      this.cd.detectChanges();
      return;
    }
    if (!this.categorieChoisieId) {
      this.erreur = 'Choisissez une catégorie';
      this.cd.detectChanges();
      return;
    }

    this.chargement = true;

    const donnees = {
      limiteMensuelle: parseFloat(limite),
      categorieId: this.categorieChoisieId,
      mois: this.moisActuel,
    };

    const appel = this.idEnEdition
      ? this.budgetService.modifier(this.idEnEdition, donnees)
      : this.budgetService.creer(donnees);

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
    this.budgetService.supprimer(this.idASupprimer).subscribe({
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

  budgetEnEdition(): Budget | undefined {
    return this.budgets.find((b) => b.id === this.idEnEdition);
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { TransactionService, Transaction } from '../../services/transaction';
import { CategorieService, Categorie } from '../../services/categorie';

@Component({
  selector: 'app-transactions',
  imports: [],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions implements OnInit {
  transactions: Transaction[] = [];
  categoriesFiltrees: Categorie[] = [];
  erreur = '';
  chargement = false;

  modaleOuverte = false;
  idEnEdition: number | null = null;
  typeChoisi = '';
  categorieChoisieId: number | null = null;

  // Sous-modale création catégorie
  modaleCategorieOuverte = false;
  erreurCategorie = '';

  confirmationOuverte = false;
  idASupprimer: number | null = null;

  constructor(
    private transactionService: TransactionService,
    private categorieService: CategorieService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.charger();
  }

  charger() {
    this.transactionService.lister().subscribe({
      next: (data) => {
        this.transactions = data;
        this.cd.detectChanges();
      },
      error: () => {
        this.erreur = 'Erreur lors du chargement';
        this.cd.detectChanges();
      },
    });
  }

  // Quand on change le type, on recharge les catégories correspondantes
  changerType(type: string) {
    this.typeChoisi = type;
    this.categorieChoisieId = null;
    this.categoriesFiltrees = [];
    if (type) {
      this.categorieService.listerParType(type).subscribe({
        next: (data) => {
          this.categoriesFiltrees = data;
          this.cd.detectChanges();
        },
        error: () => this.cd.detectChanges(),
      });
    }
    this.cd.detectChanges();
  }

  choisirCategorie(id: number) {
    this.categorieChoisieId = id;
    this.cd.detectChanges();
  }

  ouvrirAjout() {
    this.idEnEdition = null;
    this.typeChoisi = '';
    this.categorieChoisieId = null;
    this.categoriesFiltrees = [];
    this.erreur = '';
    this.modaleOuverte = true;
    this.cd.detectChanges();
  }

  editer(t: Transaction) {
    this.idEnEdition = t.id;
    this.typeChoisi = t.type;
    this.categorieChoisieId = t.categorie?.id || null;
    this.erreur = '';
    this.modaleOuverte = true;
    // Charger les catégories du bon type
    this.categorieService.listerParType(t.type).subscribe({
      next: (data) => {
        this.categoriesFiltrees = data;
        this.cd.detectChanges();
      },
      error: () => this.cd.detectChanges(),
    });
    this.cd.detectChanges();
  }

  fermerModale() {
    this.modaleOuverte = false;
    this.idEnEdition = null;
    this.erreur = '';
    this.cd.detectChanges();
  }

  valider(montant: string, date: string, description: string) {
    this.erreur = '';

    if (!montant || parseFloat(montant) <= 0) {
      this.erreur = 'Le montant doit être supérieur à 0';
      this.cd.detectChanges();
      return;
    }
    if (!this.typeChoisi) {
      this.erreur = 'Choisissez le type (revenu ou dépense)';
      this.cd.detectChanges();
      return;
    }
    if (!this.categorieChoisieId) {
      this.erreur = 'Choisissez une catégorie';
      this.cd.detectChanges();
      return;
    }
    if (!date) {
      this.erreur = 'La date est obligatoire';
      this.cd.detectChanges();
      return;
    }
    if (new Date(date) > new Date()) {
      this.erreur = 'La date ne peut pas être dans le futur';
      this.cd.detectChanges();
      return;
    }

    this.chargement = true;

    const donnees = {
      montant: parseFloat(montant),
      type: this.typeChoisi,
      date: date,
      description: description || '',
      categorieId: this.categorieChoisieId,
    };

    const appel = this.idEnEdition
      ? this.transactionService.modifier(this.idEnEdition, donnees)
      : this.transactionService.creer(donnees);

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

  // ---- Création de catégorie à la volée ----
  ouvrirCreationCategorie() {
    if (!this.typeChoisi) {
      this.erreur = "Choisissez d'abord le type";
      this.cd.detectChanges();
      return;
    }
    this.erreurCategorie = '';
    this.modaleCategorieOuverte = true;
    this.cd.detectChanges();
  }

  fermerCreationCategorie() {
    this.modaleCategorieOuverte = false;
    this.cd.detectChanges();
  }

  creerCategorie(nom: string) {
    this.erreurCategorie = '';
    if (!nom || !nom.trim()) {
      this.erreurCategorie = 'Le nom est obligatoire';
      this.cd.detectChanges();
      return;
    }

    const donnees = { nom: nom.trim(), type: this.typeChoisi, icone: 'bi-tag', couleur: '#4a86bd' };

    this.categorieService.creer(donnees).subscribe({
      next: (nouvelle) => {
        this.categoriesFiltrees.push(nouvelle);
        this.categorieChoisieId = nouvelle.id;
        this.modaleCategorieOuverte = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        this.erreurCategorie = err?.error?.message || 'Erreur';
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
    this.transactionService.supprimer(this.idASupprimer).subscribe({
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

  transactionEnEdition(): Transaction | undefined {
    return this.transactions.find((t) => t.id === this.idEnEdition);
  }
}

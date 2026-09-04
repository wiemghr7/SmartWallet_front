import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { TransactionService, Transaction } from '../../services/transaction';
import { CategorieService, Categorie } from '../../services/categorie';
import { BudgetService, Budget } from '../../services/budget';

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

  budgets: Budget[] = [];

  // Confirmation dépassement budget
  confirmationBudgetOuverte = false;
  messageDepassement = '';
  donneesEnAttente: any = null;

  // Filtres
  filtreType = 'TOUT';
  filtreMois = '';
  listeTypeOuverte = false;
  optionsType = [
    { valeur: 'TOUT', label: 'Tout' },
    { valeur: 'REVENU', label: 'Revenus' },
    { valeur: 'DEPENSE', label: 'Dépenses' },
  ];
  // Sélecteur de mois personnalisé
  listeMoisOuverte = false;
  anneeAffichee = new Date().getFullYear();
  nomsMois = [
    'Jan',
    'Fév',
    'Mar',
    'Avr',
    'Mai',
    'Juin',
    'Juil',
    'Août',
    'Sep',
    'Oct',
    'Nov',
    'Déc',
  ];
  basculerListeMois() {
    this.listeMoisOuverte = !this.listeMoisOuverte;
    this.cd.detectChanges();
  }

  changerAnnee(delta: number) {
    this.anneeAffichee += delta;
    this.cd.detectChanges();
  }

  choisirMois(indexMois: number) {
    // indexMois : 0 = janvier ... 11 = décembre
    this.filtreMois = `${this.anneeAffichee}-${String(indexMois + 1).padStart(2, '0')}`;
    this.listeMoisOuverte = false;
    this.cd.detectChanges();
  }

  labelMoisChoisi(): string {
    if (!this.filtreMois) return 'Tous les mois';
    const [annee, mois] = this.filtreMois.split('-');
    return `${this.nomsMois[parseInt(mois) - 1]} ${annee}`;
  }

  moisEstActif(indexMois: number): boolean {
    if (!this.filtreMois) return false;
    const cible = `${this.anneeAffichee}-${String(indexMois + 1).padStart(2, '0')}`;
    return this.filtreMois === cible;
  }
  constructor(
    private transactionService: TransactionService,
    private categorieService: CategorieService,
    private budgetService: BudgetService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.charger();
    this.chargerBudgets();
  }

  chargerBudgets() {
    this.budgetService.lister().subscribe({
      next: (data) => {
        this.budgets = data;
        this.cd.detectChanges();
      },
      error: () => this.cd.detectChanges(),
    });
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

  // ---- Filtres ----
  transactionsFiltrees(): Transaction[] {
    return this.transactions.filter((t) => {
      if (this.filtreType !== 'TOUT' && t.type !== this.filtreType) {
        return false;
      }
      if (this.filtreMois && !t.date.startsWith(this.filtreMois)) {
        return false;
      }
      return true;
    });
  }

  basculerListeType() {
    this.listeTypeOuverte = !this.listeTypeOuverte;
    this.cd.detectChanges();
  }

  choisirFiltreType(valeur: string) {
    this.filtreType = valeur;
    this.listeTypeOuverte = false;
    this.cd.detectChanges();
  }

  labelTypeChoisi(): string {
    const opt = this.optionsType.find((o) => o.valeur === this.filtreType);
    return opt ? opt.label : 'Tout';
  }

  reinitialiserFiltres() {
    this.filtreType = 'TOUT';
    this.filtreMois = '';
    this.listeTypeOuverte = false;
    this.cd.detectChanges();
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
    this.chargement = false;
    this.modaleOuverte = true;
    this.cd.detectChanges();
  }

  editer(t: Transaction) {
    this.idEnEdition = t.id;
    this.typeChoisi = t.type;
    this.categorieChoisieId = t.categorie?.id || null;
    this.erreur = '';
    this.modaleOuverte = true;
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

    const donnees = {
      montant: parseFloat(montant),
      type: this.typeChoisi,
      date: date,
      description: description || '',
      categorieId: this.categorieChoisieId,
    };

    // Vérifier le dépassement de budget (seulement pour les dépenses, en création)
    if (this.typeChoisi === 'DEPENSE' && !this.idEnEdition) {
      const budget = this.budgets.find((b) => b.categorie?.id === this.categorieChoisieId);
      if (budget) {
        const nouvelleUtilisation = budget.utilisationActuelle + parseFloat(montant);
        if (nouvelleUtilisation > budget.limiteMensuelle) {
          // Dépassement détecté → demander confirmation
          const depassement = nouvelleUtilisation - budget.limiteMensuelle;
          this.messageDepassement = `Cette dépense fera dépasser votre budget "${budget.categorie?.nom}" de ${depassement.toFixed(2)} DT (limite : ${budget.limiteMensuelle} DT).`;
          this.donneesEnAttente = donnees;
          this.confirmationBudgetOuverte = true;
          this.cd.detectChanges();
          return;
        }
      }
    }

    // Pas de dépassement → enregistrer directement
    this.enregistrerTransaction(donnees);
  }

  enregistrerTransaction(donnees: any) {
    this.chargement = true;

    const appel = this.idEnEdition
      ? this.transactionService.modifier(this.idEnEdition, donnees)
      : this.transactionService.creer(donnees);

    appel.subscribe({
      next: () => {
        this.chargement = false;
        this.fermerModale();
        this.charger();
        this.chargerBudgets();
      },
      error: (err) => {
        this.chargement = false;
        this.erreur = err?.error?.message || 'Erreur';
        this.cd.detectChanges();
      },
    });
  }

  confirmerDepassement() {
    this.confirmationBudgetOuverte = false;
    if (this.donneesEnAttente) {
      this.enregistrerTransaction(this.donneesEnAttente);
      this.donneesEnAttente = null;
    }
    this.cd.detectChanges();
  }

  annulerDepassement() {
    this.confirmationBudgetOuverte = false;
    this.donneesEnAttente = null;
    this.cd.detectChanges();
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
  @HostListener('document:click', ['$event'])
  clicExterne(event: MouseEvent) {
    const cible = event.target as HTMLElement;
    // Fermer la liste type si on clique en dehors d'elle
    if (this.listeTypeOuverte && !cible.closest('.type-select')) {
      this.listeTypeOuverte = false;
      this.cd.detectChanges();
    }
    // Fermer la liste mois si on clique en dehors d'elle
    if (this.listeMoisOuverte && !cible.closest('.mois-select')) {
      this.listeMoisOuverte = false;
      this.cd.detectChanges();
    }
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProfilService, Profil } from '../../services/profil';
import { CategorieService, Categorie } from '../../services/categorie';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  profil: Profil | null = null;
  categories: Categorie[] = [];

  message = '';
  erreur = '';
  chargement = false;

  // Modale mot de passe
  modaleMdpOuverte = false;
  erreurMdp = '';
  messageMdp = '';
  chargementMdp = false;

  // Modale catégorie
  modaleCatOuverte = false;
  typeChoisi = '';
  erreurCat = '';

  // Confirmation suppression catégorie
  confirmationOuverte = false;
  idASupprimer: number | null = null;

  constructor(
    private profilService: ProfilService,
    private categorieService: CategorieService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.charger();
    this.chargerCategories();
  }

  charger() {
    this.profilService.getProfil().subscribe({
      next: (data) => {
        this.profil = data;
        this.cd.detectChanges();
      },
      error: () => this.cd.detectChanges(),
    });
  }

  chargerCategories() {
    this.categorieService.lister().subscribe({
      next: (data) => {
        this.categories = data;
        this.cd.detectChanges();
      },
      error: () => this.cd.detectChanges(),
    });
  }

  categoriesPrivees(): Categorie[] {
    return this.categories.filter((c) => !c.estGlobale);
  }

  // ---- Modifier infos ----
  enregistrerInfos(nom: string, prenom: string, revenu: string) {
    this.message = '';
    this.erreur = '';

    if (!nom.trim() || !prenom.trim()) {
      this.erreur = 'Le nom et le prénom sont obligatoires';
      this.cd.detectChanges();
      return;
    }

    this.chargement = true;

    const donnees = {
      nom: nom.trim(),
      prenom: prenom.trim(),
      email: this.profil?.email,
      revenuMensuel: revenu ? parseFloat(revenu) : 0,
    };

    this.profilService.modifier(donnees).subscribe({
      next: (data) => {
        this.chargement = false;
        this.profil = data;
        this.message = 'Vos informations ont été mises à jour';
        localStorage.setItem('prenom', data.prenom);
        localStorage.setItem('nom', data.nom);
        this.cd.detectChanges();
      },
      error: (err) => {
        this.chargement = false;
        this.erreur = err?.error?.message || 'Erreur';
        this.cd.detectChanges();
      },
    });
  }

  // ---- Modale mot de passe ----
  ouvrirMdp() {
    this.erreurMdp = '';
    this.messageMdp = '';
    this.modaleMdpOuverte = true;
    this.cd.detectChanges();
  }

  fermerMdp() {
    this.modaleMdpOuverte = false;
    this.cd.detectChanges();
  }

  changerMdp(ancien: string, nouveau: string, confirme: string) {
    this.erreurMdp = '';

    if (!ancien) {
      this.erreurMdp = 'Saisissez votre mot de passe actuel';
      this.cd.detectChanges();
      return;
    }
    if (!nouveau || nouveau.length < 6) {
      this.erreurMdp = 'Le nouveau mot de passe doit contenir au moins 6 caractères';
      this.cd.detectChanges();
      return;
    }
    if (nouveau !== confirme) {
      this.erreurMdp = 'Les mots de passe ne correspondent pas';
      this.cd.detectChanges();
      return;
    }

    this.chargementMdp = true;

    const donnees = { ancienMotDePasse: ancien, nouveauMotDePasse: nouveau };

    this.profilService.changerMotDePasse(donnees).subscribe({
      next: () => {
        this.chargementMdp = false;
        this.modaleMdpOuverte = false;
        this.message = 'Votre mot de passe a été modifié';
        this.cd.detectChanges();
      },
      error: (err) => {
        this.chargementMdp = false;
        this.erreurMdp = err?.error?.message || 'Erreur';
        this.cd.detectChanges();
      },
    });
  }

  // ---- Modale catégorie ----
  ouvrirCat() {
    this.typeChoisi = '';
    this.erreurCat = '';
    this.modaleCatOuverte = true;
    this.cd.detectChanges();
  }

  fermerCat() {
    this.modaleCatOuverte = false;
    this.cd.detectChanges();
  }

  choisirType(type: string) {
    this.typeChoisi = type;
    this.cd.detectChanges();
  }

  creerCat(nom: string) {
    this.erreurCat = '';
    if (!nom.trim()) {
      this.erreurCat = 'Le nom est obligatoire';
      this.cd.detectChanges();
      return;
    }
    if (!this.typeChoisi) {
      this.erreurCat = 'Choisissez le type';
      this.cd.detectChanges();
      return;
    }

    const donnees = { nom: nom.trim(), type: this.typeChoisi, icone: 'bi-tag', couleur: '#4a86bd' };

    this.categorieService.creer(donnees).subscribe({
      next: () => {
        this.modaleCatOuverte = false;
        this.chargerCategories();
      },
      error: (err) => {
        this.erreurCat = err?.error?.message || 'Erreur';
        this.cd.detectChanges();
      },
    });
  }

  // ---- Suppression catégorie ----
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
    this.categorieService.supprimer(this.idASupprimer).subscribe({
      next: () => {
        this.confirmationOuverte = false;
        this.idASupprimer = null;
        this.chargerCategories();
      },
      error: () => {
        this.confirmationOuverte = false;
        this.cd.detectChanges();
      },
    });
  }
}

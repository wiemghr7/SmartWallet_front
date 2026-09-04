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
  photoChoisie = '';

  // Villes
  villes = [
    'Ariana',
    'Béja',
    'Ben Arous',
    'Bizerte',
    'Gabès',
    'Gafsa',
    'Jendouba',
    'Kairouan',
    'Kasserine',
    'Kébili',
    'Le Kef',
    'Mahdia',
    'La Manouba',
    'Médenine',
    'Monastir',
    'Nabeul',
    'Sfax',
    'Sidi Bouzid',
    'Siliana',
    'Sousse',
    'Tataouine',
    'Tozeur',
    'Tunis',
    'Zaghouan',
  ];
  villeChoisie = '';
  listeVillesOuverte = false;
  // Calendrier date de naissance
  calendrierOuvert = false;
  dateNaissanceChoisie = ''; // format "1998-04-12"
  moisAffiche = new Date().getMonth(); // 0-11
  anneeAffichee = new Date().getFullYear();
  nomsMoisComplets = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];
  joursSemaine = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  // Modale mot de passe
  modaleMdpOuverte = false;
  erreurMdp = '';
  chargementMdp = false;

  // Modale catégorie
  modaleCatOuverte = false;
  typeChoisi = '';
  erreurCat = '';

  // Confirmation suppression catégorie
  confirmationOuverte = false;
  idASupprimer: number | null = null;
  erreurSuppression = '';

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
        this.villeChoisie = data.ville || '';
        this.dateNaissanceChoisie = data.dateNaissance || '';
        this.photoChoisie = data.photo || '';
        if (data.dateNaissance) {
          const d = new Date(data.dateNaissance);
          this.moisAffiche = d.getMonth();
          this.anneeAffichee = d.getFullYear();
        }
        this.cd.detectChanges();
      },
      error: () => this.cd.detectChanges(),
    });
  }
  choisirPhoto(event: any) {
    const fichier = event.target.files[0];
    if (!fichier) return;

    // Vérifier que c'est une image
    if (!fichier.type.startsWith('image/')) {
      this.erreur = 'Veuillez choisir une image';
      this.cd.detectChanges();
      return;
    }
    // Limiter la taille (2 Mo)
    if (fichier.size > 2 * 1024 * 1024) {
      this.erreur = "L'image est trop lourde (max 2 Mo)";
      this.cd.detectChanges();
      return;
    }

    // Convertir en Base64
    const reader = new FileReader();
    reader.onload = () => {
      this.photoChoisie = reader.result as string;
      this.enregistrerPhoto();
      this.cd.detectChanges();
    };
    reader.readAsDataURL(fichier);
  }

  enregistrerPhoto() {
    const donnees = {
      nom: this.profil?.nom,
      prenom: this.profil?.prenom,
      email: this.profil?.email,
      revenuMensuel: this.profil?.revenuMensuel,
      ville: this.villeChoisie || null,
      dateNaissance: this.dateNaissanceChoisie || null,
      photo: this.photoChoisie,
    };
    this.profilService.modifier(donnees).subscribe({
      next: (data) => {
        this.profil = data;
        this.message = 'Photo mise à jour';
        localStorage.setItem('photo', data.photo || '');
        this.cd.detectChanges();
      },
      error: () => this.cd.detectChanges(),
    });
  }

  supprimerPhoto() {
    this.photoChoisie = '';
    this.enregistrerPhoto();
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

  // ---- Liste des villes ----
  basculerListeVilles() {
    this.listeVillesOuverte = !this.listeVillesOuverte;
    this.cd.detectChanges();
  }

  choisirVille(ville: string) {
    this.villeChoisie = ville;
    this.listeVillesOuverte = false;
    this.cd.detectChanges();
  }
  // ---- Calendrier ----
  basculerCalendrier() {
    this.calendrierOuvert = !this.calendrierOuvert;
    this.cd.detectChanges();
  }

  changerMoisCalendrier(delta: number) {
    this.moisAffiche += delta;
    if (this.moisAffiche > 11) {
      this.moisAffiche = 0;
      this.anneeAffichee++;
    }
    if (this.moisAffiche < 0) {
      this.moisAffiche = 11;
      this.anneeAffichee--;
    }
    this.cd.detectChanges();
  }

  changerAnneeCalendrier(delta: number) {
    this.anneeAffichee += delta;
    this.cd.detectChanges();
  }

  // Renvoie la liste des jours à afficher (avec cases vides au début)
  joursDuMois(): (number | null)[] {
    const premierJour = new Date(this.anneeAffichee, this.moisAffiche, 1);
    // getDay : 0=dimanche ... on veut lundi=0
    let debut = premierJour.getDay() - 1;
    if (debut < 0) debut = 6;
    const nbJours = new Date(this.anneeAffichee, this.moisAffiche + 1, 0).getDate();
    const cases: (number | null)[] = [];
    for (let i = 0; i < debut; i++) cases.push(null);
    for (let j = 1; j <= nbJours; j++) cases.push(j);
    return cases;
  }

  choisirJour(jour: number) {
    const mois = String(this.moisAffiche + 1).padStart(2, '0');
    const j = String(jour).padStart(2, '0');
    this.dateNaissanceChoisie = `${this.anneeAffichee}-${mois}-${j}`;
    this.calendrierOuvert = false;
    this.cd.detectChanges();
  }

  jourEstActif(jour: number): boolean {
    const mois = String(this.moisAffiche + 1).padStart(2, '0');
    const j = String(jour).padStart(2, '0');
    return this.dateNaissanceChoisie === `${this.anneeAffichee}-${mois}-${j}`;
  }

  labelDateNaissance(): string {
    if (!this.dateNaissanceChoisie) return 'Choisir une date';
    const [annee, mois, jour] = this.dateNaissanceChoisie.split('-');
    return `${jour} ${this.nomsMoisComplets[parseInt(mois) - 1]} ${annee}`;
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
      ville: this.villeChoisie || null,
      dateNaissance: this.dateNaissanceChoisie || null,
      photo: this.photoChoisie || null,
    };

    this.profilService.modifier(donnees).subscribe({
      next: (data) => {
        this.chargement = false;
        this.profil = data;
        this.villeChoisie = data.ville || '';
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
    this.erreurSuppression = '';
    this.confirmationOuverte = true;
    this.cd.detectChanges();
  }

  annulerSuppression() {
    this.confirmationOuverte = false;
    this.idASupprimer = null;
    this.erreurSuppression = '';
    this.cd.detectChanges();
  }

  confirmerSuppression() {
    if (this.idASupprimer === null) return;
    this.erreurSuppression = '';
    this.categorieService.supprimer(this.idASupprimer).subscribe({
      next: () => {
        this.confirmationOuverte = false;
        this.idASupprimer = null;
        this.chargerCategories();
      },
      error: (err) => {
        this.erreurSuppression = err?.error?.message || 'Erreur lors de la suppression';
        this.cd.detectChanges();
      },
    });
  }
}

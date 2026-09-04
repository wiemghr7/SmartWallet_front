import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  erreur = '';
  chargement = false;
  genreChoisi = '';

  // Liste des villes
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
  photoChoisie = '';
  constructor(
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {}
  choisirPhoto(event: any) {
    const fichier = event.target.files[0];
    if (!fichier) return;
    if (!fichier.type.startsWith('image/')) {
      this.erreur = 'Veuillez choisir une image';
      this.cd.detectChanges();
      return;
    }
    if (fichier.size > 2 * 1024 * 1024) {
      this.erreur = "L'image est trop lourde (max 2 Mo)";
      this.cd.detectChanges();
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.photoChoisie = reader.result as string;
      this.cd.detectChanges();
    };
    reader.readAsDataURL(fichier);
  }
  choisirGenre(genre: string) {
    this.genreChoisi = genre;
    this.cd.detectChanges();
  }

  basculerListeVilles() {
    this.listeVillesOuverte = !this.listeVillesOuverte;
    this.cd.detectChanges();
  }

  choisirVille(ville: string) {
    this.villeChoisie = ville;
    this.listeVillesOuverte = false;
    this.cd.detectChanges();
  }

  sInscrire(
    nom: string,
    prenom: string,
    email: string,
    motDePasse: string,
    confirmMotDePasse: string,
    revenuMensuel: string,
    soldeInitial: string,
    dateNaissance: string,
  ) {
    this.erreur = '';

    if (!nom || !nom.trim() || !prenom || !prenom.trim()) {
      this.erreur = 'Le nom et le prénom sont obligatoires';
      this.cd.detectChanges();
      return;
    }
    if (!email || !email.trim()) {
      this.erreur = "L'email est obligatoire";
      this.cd.detectChanges();
      return;
    }
    if (!this.emailValide(email)) {
      this.erreur = "Format d'email invalide";
      this.cd.detectChanges();
      return;
    }
    if (!motDePasse || motDePasse.length < 6) {
      this.erreur = 'Le mot de passe doit contenir au moins 6 caractères';
      this.cd.detectChanges();
      return;
    }
    if (motDePasse !== confirmMotDePasse) {
      this.erreur = 'Les mots de passe ne correspondent pas';
      this.cd.detectChanges();
      return;
    }
    const revenu = parseFloat(revenuMensuel);
    const solde = parseFloat(soldeInitial);
    if (isNaN(revenu) || revenu < 0) {
      this.erreur = 'Le revenu mensuel doit être positif';
      this.cd.detectChanges();
      return;
    }
    if (isNaN(solde) || solde < 0) {
      this.erreur = 'Le solde initial doit être positif';
      this.cd.detectChanges();
      return;
    }

    this.chargement = true;

    const donnees = {
      nom,
      prenom,
      email,
      motDePasse,
      revenuMensuel: revenu,
      soldeInitial: solde,
      ville: this.villeChoisie || null,
      dateNaissance: dateNaissance || null,
      genre: this.genreChoisi || null,
      photo: this.photoChoisie || null,
    };

    this.authService.register(donnees).subscribe({
      next: (reponse) => {
        this.chargement = false;
        this.authService.sauvegarderSession(reponse);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.chargement = false;
        this.erreur = err?.error?.message || "Erreur lors de l'inscription";
        this.cd.detectChanges();
      },
    });
  }

  emailValide(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}

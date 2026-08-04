import { Component, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  erreur = '';
  chargement = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef,
  ) {}

  seConnecter(email: string, motDePasse: string) {
    this.erreur = '';

    if (!email || !email.trim()) {
      this.erreur = 'Veuillez saisir votre email';
      return;
    }
    if (!this.emailValide(email)) {
      this.erreur = "Format d'email invalide";
      return;
    }
    if (!motDePasse) {
      this.erreur = 'Veuillez saisir votre mot de passe';
      return;
    }

    this.chargement = true;

    this.authService.login({ email, motDePasse }).subscribe({
      next: (reponse) => {
        this.chargement = false;
        this.authService.sauvegarderSession(reponse);
        if (reponse.role === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.chargement = false;
        this.erreur = err?.error?.message || 'Email ou mot de passe incorrect';
        this.cd.detectChanges();
      },
    });
  }

  emailValide(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}

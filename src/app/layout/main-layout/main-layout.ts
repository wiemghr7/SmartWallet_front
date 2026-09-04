import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ProfilService } from '../../services/profil';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout implements OnInit {
  photo = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private profilService: ProfilService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    // Charger la photo depuis le profil
    this.profilService.getProfil().subscribe({
      next: (data) => {
        this.photo = data.photo || '';
        this.cd.detectChanges();
      },
      error: () => this.cd.detectChanges(),
    });
  }

  deconnecter() {
    this.authService.deconnecter();
    this.router.navigate(['/login']);
  }
}

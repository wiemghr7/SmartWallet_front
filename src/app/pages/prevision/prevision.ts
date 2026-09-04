import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PrevisionService } from '../../services/prevision';

@Component({
  selector: 'app-prevision',
  imports: [],
  templateUrl: './prevision.html',
  styleUrl: './prevision.css',
})
export class Prevision implements OnInit {
  prevision: any = null;
  rapport: any = null;
  chargement = true;

  constructor(
    private service: PrevisionService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.charger();
  }

  charger() {
    this.chargement = true;
    // Charger la prévision
    this.service.getPrevision().subscribe({
      next: (data) => {
        this.prevision = data;
        this.cd.detectChanges();
      },
      error: () => this.cd.detectChanges(),
    });
    // Charger le rapport
    this.service.getRapport().subscribe({
      next: (data) => {
        this.rapport = data;
        this.chargement = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.rapport = { erreur: true, message: 'Erreur lors du chargement du rapport.' };
        this.chargement = false;
        this.cd.detectChanges();
      },
    });
  }

  soldeNegatif(): boolean {
    return this.prevision && this.prevision.soldePrevu < 0;
  }

  // Couleur du score selon sa valeur
  couleurScore(): string {
    if (!this.rapport) return '#4a86bd';
    const s = this.rapport.score;
    if (s >= 75) return '#3d8b72';
    if (s >= 50) return '#d99a4e';
    return '#c05f5f';
  }
}

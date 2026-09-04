import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { DashboardService, DashboardResume } from '../../services/dashboard';
import { InsightsService } from '../../services/insights';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  resume: DashboardResume | null = null;
  nomUtilisateur = '';

  analyse: any = null;
  moisChoisi = '';
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
  chartDepenses: any = null;
  chartEvolution: any = null;
  basculerListeMois() {
    this.listeMoisOuverte = !this.listeMoisOuverte;
    this.cd.detectChanges();
  }

  changerAnnee(delta: number) {
    this.anneeAffichee += delta;
    this.cd.detectChanges();
  }

  choisirMois(indexMois: number) {
    this.moisChoisi = `${this.anneeAffichee}-${String(indexMois + 1).padStart(2, '0')}`;
    this.listeMoisOuverte = false;
    this.chargerAnalyse();
  }

  labelMoisChoisi(): string {
    if (!this.moisChoisi) return 'Choisir';
    const [annee, mois] = this.moisChoisi.split('-');
    return `${this.nomsMois[parseInt(mois) - 1]} ${annee}`;
  }

  moisEstActif(indexMois: number): boolean {
    if (!this.moisChoisi) return false;
    const cible = `${this.anneeAffichee}-${String(indexMois + 1).padStart(2, '0')}`;
    return this.moisChoisi === cible;
  }
  constructor(
    private dashboardService: DashboardService,
    private insightsService: InsightsService,
    private cd: ChangeDetectorRef,
  ) {}
  @HostListener('document:click', ['$event'])
  clicExterne(event: MouseEvent) {
    const cible = event.target as HTMLElement;
    // Fermer le sélecteur de mois si on clique en dehors
    if (this.listeMoisOuverte && !cible.closest('.mois-select')) {
      this.listeMoisOuverte = false;
      this.cd.detectChanges();
    }
  }
  ngOnInit() {
    this.nomUtilisateur = localStorage.getItem('prenom') || '';
    const maintenant = new Date();
    this.moisChoisi = `${maintenant.getFullYear()}-${String(maintenant.getMonth() + 1).padStart(2, '0')}`;
    this.charger();
    this.chargerAnalyse();
  }

  charger() {
    this.dashboardService.getResume().subscribe({
      next: (data) => {
        this.resume = data;
        this.cd.detectChanges();
      },
      error: () => this.cd.detectChanges(),
    });
  }

  chargerAnalyse() {
    this.insightsService.getAnalyse(this.moisChoisi).subscribe({
      next: (data) => {
        this.analyse = data;
        this.cd.detectChanges();
        setTimeout(() => this.dessinerGraphiques(), 100);
      },
      error: () => this.cd.detectChanges(),
    });
  }

  aDesDonnees(obj: any): boolean {
    return obj && Object.keys(obj).length > 0;
  }

  dessinerGraphiques() {
    if (!this.analyse) return;

    if (this.chartDepenses) {
      this.chartDepenses.destroy();
      this.chartDepenses = null;
    }
    if (this.chartEvolution) {
      this.chartEvolution.destroy();
      this.chartEvolution = null;
    }

    // CAMEMBERT : Dépenses par catégorie (du mois)
    const ctxDep = document.getElementById('chartDepenses') as HTMLCanvasElement;
    const depenses = this.analyse.depensesParCategorie || {};
    if (ctxDep && Object.keys(depenses).length > 0) {
      this.chartDepenses = new Chart(ctxDep, {
        type: 'doughnut',
        data: {
          labels: Object.keys(depenses),
          datasets: [
            {
              data: Object.values(depenses) as number[],
              backgroundColor: [
                '#4a86bd',
                '#3d8b72',
                '#e8a33d',
                '#c05f5f',
                '#8e5fa8',
                '#5fb8b0',
                '#d97ba0',
                '#7a9e3d',
                '#b8925f',
                '#6f7fc7',
                '#4aa3c7',
                '#d76b4a',
                '#9b6fb0',
                '#5f9e6f',
                '#c7a34a',
                '#fe0077',
              ],
              borderWidth: 2,
              borderColor: '#ffffff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: { legend: { position: 'right', labels: { padding: 14, font: { size: 12 } } } },
        },
      });
    }

    // COURBE : Évolution revenus vs dépenses (6 mois)
    const ctxEvol = document.getElementById('chartEvolution') as HTMLCanvasElement;
    const revMois = this.analyse.revenusParMois || {};
    const depMois = this.analyse.depensesParMois || {};
    if (ctxEvol && Object.keys(revMois).length > 0) {
      this.chartEvolution = new Chart(ctxEvol, {
        type: 'line',
        data: {
          labels: Object.keys(revMois),
          datasets: [
            {
              label: 'Revenus',
              data: Object.values(revMois) as number[],
              borderColor: '#3d8b72',
              backgroundColor: 'rgba(61, 139, 114, 0.1)',
              fill: true,
              tension: 0.35,
              borderWidth: 3,
              pointBackgroundColor: '#3d8b72',
              pointRadius: 4,
            },
            {
              label: 'Dépenses',
              data: Object.values(depMois) as number[],
              borderColor: '#c05f5f',
              backgroundColor: 'rgba(192, 95, 95, 0.1)',
              fill: true,
              tension: 0.35,
              borderWidth: 3,
              pointBackgroundColor: '#c05f5f',
              pointRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 13 } } } },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: '#6b8aa6' },
              grid: { color: '#eef4fa' },
              border: { display: false },
            },
            x: {
              ticks: { color: '#16324f', font: { size: 12 } },
              grid: { display: false },
              border: { display: false },
            },
          },
        },
      });
    }
  }
}

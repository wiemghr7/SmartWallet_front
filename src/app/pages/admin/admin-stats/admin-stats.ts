import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AdminStatsService, Stats } from '../../../services/admin-stats';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-admin-stats',
  imports: [],
  templateUrl: './admin-stats.html',
  styleUrl: './admin-stats.css',
})
export class AdminStats implements OnInit {
  stats: Stats | null = null;

  constructor(
    private service: AdminStatsService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.service.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.cd.detectChanges();
        setTimeout(() => this.dessinerGraphiques(), 100);
      },
      error: () => this.cd.detectChanges(),
    });
  }

  dessinerGraphiques() {
    if (!this.stats) return;

    // 1. DONUT : Revenus vs Dépenses
    const ctxFlux = document.getElementById('chartFlux') as HTMLCanvasElement;
    if (ctxFlux) {
      new Chart(ctxFlux, {
        type: 'doughnut',
        data: {
          labels: ['Revenus', 'Dépenses'],
          datasets: [
            {
              data: [this.stats.totalRevenus, this.stats.totalDepenses],
              backgroundColor: ['#3d8b72', '#c05f5f'],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '68%',
          plugins: { legend: { position: 'bottom', labels: { padding: 18, font: { size: 13 } } } },
        },
      });
    }

    // 2. DONUT : Comptes actifs vs suspendus
    const ctxComptes = document.getElementById('chartComptes') as HTMLCanvasElement;
    if (ctxComptes) {
      new Chart(ctxComptes, {
        type: 'doughnut',
        data: {
          labels: ['Actifs', 'Suspendus'],
          datasets: [
            {
              data: [this.stats.utilisateursActifs, this.stats.utilisateursSuspendus],
              backgroundColor: ['#4a86bd', '#dcebf7'],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '68%',
          plugins: { legend: { position: 'bottom', labels: { padding: 18, font: { size: 13 } } } },
        },
      });
    }

    // 3. CAMEMBERT : Répartition des dépenses par catégorie
    const ctxCat = document.getElementById('chartCategories') as HTMLCanvasElement;
    const depensesParCat = (this.stats as any).depensesParCategorie || {};
    const nomsCategories = Object.keys(depensesParCat);
    const valeursCategories = Object.values(depensesParCat);
    if (ctxCat && nomsCategories.length > 0) {
      new Chart(ctxCat, {
        type: 'pie',
        data: {
          labels: nomsCategories,
          datasets: [
            {
              data: valeursCategories as number[],
              backgroundColor: [
                '#2d5f8f',
                '#4a86bd',
                '#7fb0d9',
                '#b8d5ec',
                '#3d8b72',
                '#b8925f',
                '#c05f5f',
                '#8e5fa8',
                '#5f8ea8',
                '#a8875f',
              ],
              borderWidth: 2,
              borderColor: '#ffffff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'right', labels: { padding: 14, font: { size: 12 } } } },
        },
      });
    }

    // 4. COURBE : Croissance des inscriptions par mois
    const ctxInscr = document.getElementById('chartInscriptions') as HTMLCanvasElement;
    const inscrParMois = (this.stats as any).inscriptionsParMois || {};
    const moisLabels = Object.keys(inscrParMois);
    const moisValeurs = Object.values(inscrParMois);
    if (ctxInscr && moisLabels.length > 0) {
      new Chart(ctxInscr, {
        type: 'line',
        data: {
          labels: moisLabels,
          datasets: [
            {
              label: 'Inscriptions',
              data: moisValeurs as number[],
              borderColor: '#2d5f8f',
              backgroundColor: 'rgba(74, 134, 189, 0.12)',
              fill: true,
              tension: 0.35,
              pointBackgroundColor: '#2d5f8f',
              pointRadius: 5,
              pointHoverRadius: 7,
              borderWidth: 3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { precision: 0, color: '#6b8aa6' },
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

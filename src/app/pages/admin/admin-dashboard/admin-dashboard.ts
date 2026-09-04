import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AdminStatsService } from '../../../services/admin-stats';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-admin-dashboard',
  imports: [],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  stats: any = null;

  // Palette de couleurs bien distinctes (pas des nuances de bleu)
  palette = [
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
    '#7f5f8e',
    '#3d8b72',
    '#c78b4a',
    '#5f8ea8',
    '#a85f7a',
    '#6ba368',
    '#b05f5f',
    '#4a86bd',
    '#8e7a5f',
  ];

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

  aDesDonnees(obj: any): boolean {
    return obj && Object.keys(obj).length > 0;
  }

  dessinerGraphiques() {
    if (!this.stats) return;

    // DONUT : Comptes actifs vs suspendus (vert / rouge)
    const ctxComptes = document.getElementById('chartComptes') as HTMLCanvasElement;
    if (ctxComptes) {
      new Chart(ctxComptes, {
        type: 'doughnut',
        data: {
          labels: ['Actifs', 'Suspendus'],
          datasets: [
            {
              data: [this.stats.utilisateursActifs, this.stats.utilisateursSuspendus],
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

    // DONUT : Répartition par ville (palette variée)
    const ctxVille = document.getElementById('chartVille') as HTMLCanvasElement;
    const parVille = this.stats.parVille || {};
    if (ctxVille && Object.keys(parVille).length > 0) {
      new Chart(ctxVille, {
        type: 'doughnut',
        data: {
          labels: Object.keys(parVille),
          datasets: [
            {
              data: Object.values(parVille) as number[],
              backgroundColor: this.palette,
              borderWidth: 2,
              borderColor: '#ffffff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: { legend: { position: 'right', labels: { padding: 12, font: { size: 12 } } } },
        },
      });
    }

    // COURBE : Croissance des inscriptions
    const ctxInscr = document.getElementById('chartInscriptions') as HTMLCanvasElement;
    const inscrParMois = this.stats.inscriptionsParMois || {};
    if (ctxInscr && Object.keys(inscrParMois).length > 0) {
      new Chart(ctxInscr, {
        type: 'line',
        data: {
          labels: Object.keys(inscrParMois),
          datasets: [
            {
              label: 'Inscriptions',
              data: Object.values(inscrParMois) as number[],
              borderColor: '#2d5f8f',
              backgroundColor: 'rgba(74, 134, 189, 0.12)',
              fill: true,
              tension: 0.35,
              borderWidth: 3,
              pointBackgroundColor: '#2d5f8f',
              pointRadius: 5,
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

    // DONUT : Répartition par genre (rose femme / bleu homme)
    const ctxGenre = document.getElementById('chartGenre') as HTMLCanvasElement;
    const parGenre = this.stats.parGenre || {};
    if (ctxGenre && Object.keys(parGenre).length > 0) {
      const labelsGenre = Object.keys(parGenre);
      const couleursGenre = labelsGenre.map((g) => {
        if (g === 'FEMME') return '#e87ba4';
        if (g === 'HOMME') return '#4a86bd';
        return '#b8925f';
      });
      new Chart(ctxGenre, {
        type: 'doughnut',
        data: {
          labels: labelsGenre,
          datasets: [
            {
              data: Object.values(parGenre) as number[],
              backgroundColor: couleursGenre,
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 13 } } } },
        },
      });
    }

    // BARRES : Répartition par tranche d'âge (chaque barre sa couleur)
    const ctxAge = document.getElementById('chartAge') as HTMLCanvasElement;
    const parAge = this.stats.parTrancheAge || {};
    if (ctxAge && Object.keys(parAge).length > 0) {
      new Chart(ctxAge, {
        type: 'bar',
        data: {
          labels: Object.keys(parAge),
          datasets: [
            {
              label: 'Utilisateurs',
              data: Object.values(parAge) as number[],
              backgroundColor: ['#4a86bd', '#3d8b72', '#e8a33d', '#c05f5f', '#8e5fa8'],
              borderRadius: 10,
              barThickness: 44,
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

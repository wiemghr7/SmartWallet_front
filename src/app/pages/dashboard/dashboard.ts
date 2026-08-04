import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { DashboardService, DashboardResume } from '../../services/dashboard';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  resume: DashboardResume | null = null;
  nomUtilisateur = '';

  constructor(
    private dashboardService: DashboardService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.nomUtilisateur = localStorage.getItem('prenom') || '';
    this.charger();
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
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AdminStatsService, Stats } from '../../../services/admin-stats';

@Component({
  selector: 'app-admin-dashboard',
  imports: [],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
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
      },
      error: () => this.cd.detectChanges(),
    });
  }
}

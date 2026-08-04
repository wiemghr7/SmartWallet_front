import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Stats {
  totalUtilisateurs: number;
  utilisateursActifs: number;
  utilisateursSuspendus: number;
  totalTransactions: number;
  totalRevenus: number;
  totalDepenses: number;
  totalCategories: number;
  totalBudgets: number;
}

@Injectable({ providedIn: 'root' })
export class AdminStatsService {
  private apiUrl = 'http://localhost:8081/api/admin/stats';

  constructor(private http: HttpClient) {}

  getStats(): Observable<Stats> {
    return this.http.get<Stats>(this.apiUrl);
  }
}

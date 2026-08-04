import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardResume {
  soldeTotal: number;
  revenusDuMois: number;
  depensesDuMois: number;
  dernieresTransactions: any[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = 'http://localhost:8081/api/dashboard';

  constructor(private http: HttpClient) {}

  getResume(): Observable<DashboardResume> {
    return this.http.get<DashboardResume>(this.apiUrl);
  }
}

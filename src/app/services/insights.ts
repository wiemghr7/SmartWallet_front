import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InsightsService {
  private apiUrl = 'http://localhost:8081/api/insights';

  constructor(private http: HttpClient) {}

  getAnalyse(mois?: string): Observable<any> {
    const url = mois ? `${this.apiUrl}?mois=${mois}` : this.apiUrl;
    return this.http.get<any>(url);
  }
}

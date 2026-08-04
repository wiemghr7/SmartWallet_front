import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Budget {
  id: number;
  limiteMensuelle: number;
  mois: string;
  utilisationActuelle: number;
  categorie: any;
}

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private apiUrl = 'http://localhost:8081/api/budgets';

  constructor(private http: HttpClient) {}

  lister(): Observable<Budget[]> {
    return this.http.get<Budget[]>(this.apiUrl);
  }

  creer(data: any): Observable<Budget> {
    return this.http.post<Budget>(this.apiUrl, data);
  }

  modifier(id: number, data: any): Observable<Budget> {
    return this.http.put<Budget>(`${this.apiUrl}/${id}`, data);
  }

  supprimer(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

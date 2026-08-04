import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Transaction {
  id: number;
  montant: number;
  type: string;
  date: string;
  description: string;
  categorie: any;
  portefeuille: any;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private apiUrl = 'http://localhost:8081/api/transactions';

  constructor(private http: HttpClient) {}

  lister(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl);
  }

  creer(data: any): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, data);
  }

  supprimer(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  modifier(id: number, data: any): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, data);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Objectif {
  id: number;
  nom: string;
  montantCible: number;
  montantActuel: number;
  dateLimite: string | null;
}

@Injectable({ providedIn: 'root' })
export class ObjectifService {
  private apiUrl = 'http://localhost:8081/api/objectifs';

  constructor(private http: HttpClient) {}

  lister(): Observable<Objectif[]> {
    return this.http.get<Objectif[]>(this.apiUrl);
  }

  creer(data: any): Observable<Objectif> {
    return this.http.post<Objectif>(this.apiUrl, data);
  }

  modifier(id: number, data: any): Observable<Objectif> {
    return this.http.put<Objectif>(`${this.apiUrl}/${id}`, data);
  }

  supprimer(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Categorie {
  id: number;
  nom: string;
  type: string;
  icone: string;
  couleur: string;
  estGlobale: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminCategorieService {
  private apiUrl = 'http://localhost:8081/api/admin/categories';

  constructor(private http: HttpClient) {}

  lister(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(this.apiUrl);
  }

  creer(data: any): Observable<Categorie> {
    return this.http.post<Categorie>(this.apiUrl, data);
  }

  modifier(id: number, data: any): Observable<Categorie> {
    return this.http.put<Categorie>(`${this.apiUrl}/${id}`, data);
  }

  supprimer(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

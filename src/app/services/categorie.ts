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
export class CategorieService {
  private apiUrl = 'http://localhost:8081/api/categories';

  constructor(private http: HttpClient) {}

  lister(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(this.apiUrl);
  }

  listerParType(type: string): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${this.apiUrl}/type/${type}`);
  }

  creer(data: any): Observable<Categorie> {
    return this.http.post<Categorie>(this.apiUrl, data);
  }

  supprimer(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

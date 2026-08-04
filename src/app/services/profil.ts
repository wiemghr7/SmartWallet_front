import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Profil {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  revenuMensuel: number;
}

@Injectable({ providedIn: 'root' })
export class ProfilService {
  private apiUrl = 'http://localhost:8081/api/profil';

  constructor(private http: HttpClient) {}

  getProfil(): Observable<Profil> {
    return this.http.get<Profil>(this.apiUrl);
  }

  modifier(data: any): Observable<Profil> {
    return this.http.put<Profil>(this.apiUrl, data);
  }

  changerMotDePasse(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/mot-de-passe`, data);
  }
}

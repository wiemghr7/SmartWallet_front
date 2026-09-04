import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UtilisateurAdmin {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  estActif: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminUserService {
  private apiUrl = 'http://localhost:8081/api/admin/users';

  constructor(private http: HttpClient) {}

  lister(): Observable<UtilisateurAdmin[]> {
    return this.http.get<UtilisateurAdmin[]>(this.apiUrl);
  }

  basculerStatut(id: number): Observable<UtilisateurAdmin> {
    return this.http.put<UtilisateurAdmin>(`${this.apiUrl}/${id}/statut`, {});
  }
}

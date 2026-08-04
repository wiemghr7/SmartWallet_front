import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthResponse {
  token: string;
  role: string;
  nom: string;
  prenom: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/auth';

  constructor(private http: HttpClient) {}

  register(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data);
  }

  login(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data);
  }

  sauvegarderSession(reponse: AuthResponse): void {
    localStorage.setItem('token', reponse.token);
    localStorage.setItem('role', reponse.role);
    localStorage.setItem('nom', reponse.nom);
    localStorage.setItem('prenom', reponse.prenom);
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  estAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  estConnecte(): boolean {
    return localStorage.getItem('token') !== null;
  }

  deconnecter(): void {
    localStorage.clear();
  }
}

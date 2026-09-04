import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Notification {
  type: string;
  icone: string;
  titre: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = 'http://localhost:8081/api/notifications';

  constructor(private http: HttpClient) {}

  lister(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl);
  }
}

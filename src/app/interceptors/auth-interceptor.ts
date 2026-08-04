import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');

  const requete = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(requete).pipe(
    catchError((err: HttpErrorResponse) => {
      // Jeton expiré ou invalide → déconnexion + redirection
      if (err.status === 401 || err.status === 403) {
        // On ne déconnecte que si ce n'est pas une tentative de login/register
        if (!req.url.includes('/api/auth/')) {
          localStorage.clear();
          router.navigate(['/login']);
        }
      }
      return throwError(() => err);
    }),
  );
};

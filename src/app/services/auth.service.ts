import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { CashierUser } from '../models/auth.model';

const STORAGE_KEY = 'emitta_pos_cashier_session';

const MOCK_USERS: CashierUser[] = [
  {
    id: 'usr-001',
    username: 'cajero1',
    fullName: 'Carlos Zambrano Loor',
    email: 'czambrano@mitienda.com',
    role: 'CAJERO',
    branchCode: '001',
    boxCode: '001',
    branchName: 'Sucursal Matriz · Guayaquil'
  },
  {
    id: 'usr-002',
    username: 'admin',
    fullName: 'Ing. María Elena Solís',
    email: 'msolis@mitienda.com',
    role: 'SUPERVISOR',
    branchCode: '001',
    boxCode: '002',
    branchName: 'Sucursal Matriz · Administración'
  }
];

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _currentUser$ = new BehaviorSubject<CashierUser | null>(this.loadStoredUser());

  public readonly currentUser$: Observable<CashierUser | null> = this._currentUser$.asObservable();
  public readonly isLoggedIn$: Observable<boolean> = this._currentUser$.pipe(map(u => !!u));

  private loadStoredUser(): CashierUser | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  public login(username: string, pass: string): Observable<{ success: boolean; error?: string }> {
    const trimmed = (username || '').trim().toLowerCase();
    const user = MOCK_USERS.find(u => u.username.toLowerCase() === trimmed || u.email.toLowerCase() === trimmed);

    if (!user) {
      return of({ success: false, error: 'Usuario no registrado en el sistema.' });
    }

    if (pass !== '1234' && pass !== 'cajero123' && pass !== 'admin123') {
      return of({ success: false, error: 'Contraseña incorrecta.' });
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this._currentUser$.next(user);
    return of({ success: true });
  }

  public logout(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    this._currentUser$.next(null);
  }
}

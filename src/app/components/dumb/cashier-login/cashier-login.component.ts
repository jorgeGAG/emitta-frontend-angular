import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppIconComponent } from '../app-icon/app-icon.component';

@Component({
  selector: 'app-cashier-login',
  standalone: true,
  imports: [CommonModule, FormsModule, AppIconComponent],
  template: `
    <div class="login-page">
      <div class="login-card">
        <!-- Logo & Branding -->
        <div class="brand-header">
          <div class="logo-box">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <span class="badge-tag">Punto de Venta · SRI Ecuador</span>
          <h2>Acceso al Sistema</h2>
          <p>Ingresa tus credenciales de usuario para iniciar sesión.</p>
        </div>

        <!-- Error Alert -->
        <div class="error-banner" *ngIf="errorMessage">
          <app-icon name="alert" [size]="15"></app-icon>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Formulario de Login Estándar -->
        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="username">Usuario o Correo</label>
            <div class="input-wrapper">
              <span class="input-icon"><app-icon name="user" [size]="15"></app-icon></span>
              <input
                id="username"
                type="text"
                name="username"
                [(ngModel)]="username"
                required
                placeholder="Ingresa tu usuario"
                autocomplete="username"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="input-wrapper">
              <span class="input-icon"><app-icon name="lock" [size]="15"></app-icon></span>
              <input
                id="password"
                type="password"
                name="password"
                [(ngModel)]="password"
                required
                placeholder="Ingresa tu contraseña"
                autocomplete="current-password"
              />
            </div>
          </div>

          <button type="submit" class="btn-primary" [disabled]="loading || !username || !password">
            <span *ngIf="loading" class="spinner"></span>
            <span>{{ loading ? 'Autenticando...' : 'Iniciar Sesión' }}</span>
          </button>
        </form>

        <div class="footer-note">
          <span>Emitta Cloud · Facturación Electrónica SRI</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top left, #eff6ff 0%, #f1f5f9 100%);
      padding: 24px;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      background: #ffffff;
      border-radius: 16px;
      padding: 40px 32px;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04);
      border: 1px solid #e2e8f0;
    }

    .brand-header {
      text-align: center;
      margin-bottom: 28px;
    }

    .logo-box {
      width: 56px;
      height: 56px;
      background: #eff6ff;
      color: #2563eb;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.1);
    }

    .badge-tag {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #2563eb;
      background: #dbeafe;
      padding: 3px 10px;
      border-radius: 20px;
      margin-bottom: 8px;
    }

    .brand-header h2 {
      font-size: 24px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 6px;
    }

    .brand-header p {
      font-size: 13px;
      color: #64748b;
      margin: 0;
      line-height: 1.4;
    }

    .error-banner {
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #991b1b;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      text-align: left;
    }

    .form-group label {
      font-size: 13px;
      font-weight: 600;
      color: #334155;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 12px;
      font-size: 14px;
      color: #94a3b8;
      pointer-events: none;
    }

    .input-wrapper input {
      width: 100%;
      height: 44px;
      padding: 8px 12px 8px 36px;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 14px;
      color: #1e293b;
      background: #f8fafc;
      transition: all 0.2s;
    }

    .input-wrapper input:focus {
      outline: none;
      border-color: #2563eb;
      background: #ffffff;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
    }

    .btn-primary {
      height: 44px;
      background: #2563eb;
      color: #ffffff;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 6px;
      transition: background 0.2s, transform 0.1s;
    }

    .btn-primary:hover:not(:disabled) {
      background: #1d4ed8;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .footer-note {
      margin-top: 28px;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }
  `]
})
export class CashierLoginComponent {
  @Input() errorMessage: string | null = null;
  @Output() loginSuccess = new EventEmitter<{ username: string; pass: string }>();

  username: string = '';
  password: string = '';
  loading: boolean = false;

  onSubmit(): void {
    if (!this.username || !this.password) return;
    this.errorMessage = null;
    this.loginSuccess.emit({ username: this.username, pass: this.password });
  }
}

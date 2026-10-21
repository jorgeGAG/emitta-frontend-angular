import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CashierUser } from '../../../models/auth.model';
import { AppIconComponent } from '../app-icon/app-icon.component';

export type ActiveTab = 'home' | 'create-invoice' | 'invoices' | 'tenants' | 'fiscal' | 'system';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, AppIconComponent],
  template: `
    <header class="navbar-wrapper">
      <div class="wrap nav-inner">
        <!-- MARCA CON LOGO AZUL 'e' IDÉNTICO A LA CAPTURA -->
        <a class="brand" (click)="tabChange.emit('create-invoice')">
          <span class="mark">e</span>
          <span class="brand-text">emitta</span>
          <span class="by">POS & FACTURACIÓN</span>
        </a>

        <!-- NAVEGACIÓN DEL CLIENTE (SOLO LO ESENCIAL) -->
        <nav class="nav-links">
          <button
            type="button"
            class="nav-link"
            [class.active]="activeTab === 'create-invoice'"
            (click)="tabChange.emit('create-invoice')">
            <app-icon name="cart" [size]="16"></app-icon> Punto de Venta (POS)
          </button>

          <button
            type="button"
            class="nav-link"
            [class.active]="activeTab === 'invoices'"
            (click)="tabChange.emit('invoices')">
            <app-icon name="receipt" [size]="16"></app-icon> Comprobantes Electrónicos
          </button>

          <button
            type="button"
            class="nav-link"
            [class.active]="activeTab === 'fiscal'"
            (click)="tabChange.emit('fiscal')">
            <app-icon name="building" [size]="16"></app-icon> Configuración Fiscal & Firma
          </button>
        </nav>

        <!-- ESTADO Y PERFIL DE CAJERO -->
        <div class="nav-actions">
          <div class="api-status-badge" [class.online]="backendConnected" [class.offline]="!backendConnected" title="Conexión con el servicio de facturación">
            <span class="status-dot"></span>
            <span>{{ backendConnected ? 'API Conectada' : 'Reconectando...' }}</span>
          </div>

          <!-- Perfil del Cajero activo -->
          <div class="cashier-pill" *ngIf="currentUser" [title]="currentUser.email">
            <span class="cashier-avatar"><app-icon name="user" [size]="15"></app-icon></span>
            <div class="cashier-meta">
              <span class="cashier-name">{{ currentUser.fullName }}</span>
              <span class="cashier-role">Caja {{ currentUser.boxCode }} · {{ currentUser.role }}</span>
            </div>
            <button type="button" class="btn-logout" (click)="logout.emit()" title="Cerrar turno de caja">
              <app-icon name="log-out" [size]="14"></app-icon> Salir
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar-wrapper {
      background: #ffffff;
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 10px rgba(0,0,0,0.02);
    }
    .nav-inner {
      height: 85px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 9px;
      cursor: pointer;
      user-select: none;
    }
    .mark {
      display: inline-flex;
      background: #2563eb;
      color: #ffffff;
      border-radius: 9px;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      font-size: 26px;
      font-weight: 800;
      line-height: 1;
      padding-bottom: 2px;
    }
    .brand-text {
      font-size: 27px;
      font-weight: 800;
      letter-spacing: -1px;
      color: #10243a;
    }
    .by {
      font-size: 10px;
      letter-spacing: 1px;
      color: #68788a;
      margin-left: 2px;
      font-weight: 600;
    }
    .nav-links {
      display: flex;
      gap: 24px;
      align-items: center;
    }
    .nav-link {
      background: transparent;
      border: none;
      color: #52677c;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      padding: 8px 4px;
      border-bottom: 2px solid transparent;
      transition: color 0.15s, border-color 0.15s;
    }
    .nav-link:hover {
      color: #10243a;
      transform: none;
    }
    .nav-link.active {
      color: #2563eb;
      border-bottom-color: #2563eb;
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .api-status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 9px;
      border-radius: 20px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
    .api-status-badge.online {
      color: #065f46;
      border-color: #a7f3d0;
      background: #ecfdf5;
    }
    .api-status-badge.online .status-dot {
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
    }
    .api-status-badge.offline {
      color: #92400e;
      border-color: #fde68a;
      background: #fffbeb;
    }
    .api-status-badge.offline .status-dot {
      background: #f59e0b;
    }
    .cashier-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 10px;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      font-size: 12px;
    }
    .cashier-avatar {
      font-size: 14px;
    }
    .cashier-meta {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }
    .cashier-name {
      font-weight: 600;
      color: #1e293b;
      font-size: 12px;
    }
    .cashier-role {
      font-size: 10px;
      color: #64748b;
    }
    .btn-logout {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      color: #475569;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 12px;
      cursor: pointer;
      margin-left: 4px;
      transition: all 0.15s;
    }
    .btn-logout:hover {
      background: #fee2e2;
      border-color: #fca5a5;
      color: #991b1b;
    }
    @media (max-width: 950px) {
      .nav-links {
        display: none;
      }
    }
  `]
})
export class NavbarComponent {
  // RETO 4: Dumb Component puro
  @Input() activeTab: ActiveTab = 'home';
  @Input() backendConnected: boolean | null = false;
  @Input() currentUser: CashierUser | null = null;
  @Output() tabChange = new EventEmitter<ActiveTab>();
  @Output() logout = new EventEmitter<void>();
}

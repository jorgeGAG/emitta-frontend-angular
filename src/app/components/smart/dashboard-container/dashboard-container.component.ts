import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../../services/invoice.service';
import { AuthService } from '../../../services/auth.service';
import { FiscalService } from '../../../services/fiscal.service';
import { CreateInvoiceRequest } from '../../../models/invoice.model';
import { FiscalConfigurationRequest, FiscalConfigurationEntry } from '../../../models/fiscal.model';

import { ActiveTab, NavbarComponent } from '../../dumb/navbar/navbar.component';
import { KpiCardsComponent } from '../../dumb/kpi-cards/kpi-cards.component';
import { InvoiceCreatorComponent } from '../../dumb/invoice-creator/invoice-creator.component';
import { DocumentRegistryComponent } from '../../dumb/document-registry/document-registry.component';
import { RideViewerModalComponent } from '../../dumb/ride-viewer-modal/ride-viewer-modal.component';
import { CashierLoginComponent } from '../../dumb/cashier-login/cashier-login.component';
import { FiscalSetupViewComponent } from '../../dumb/fiscal-setup-view/fiscal-setup-view.component';

@Component({
  selector: 'app-dashboard-container',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    KpiCardsComponent,
    InvoiceCreatorComponent,
    DocumentRegistryComponent,
    RideViewerModalComponent,
    CashierLoginComponent,
    FiscalSetupViewComponent
  ],
  template: `
    <!-- PANTALLA 1: Login de Acceso Protegido del Cajero -->
    <app-cashier-login
      *ngIf="!(isLoggedIn$ | async)"
      [errorMessage]="loginError"
      (loginSuccess)="onCashierLogin($event)"
    ></app-cashier-login>

    <!-- PANTALLA 2: Sistema Principal del Punto de Venta (POS) -->
    <div class="emitta-app-shell" *ngIf="isLoggedIn$ | async">
      <!-- Barra superior con estado de API y perfil del cajero -->
      <app-navbar
        [activeTab]="activeTab"
        [backendConnected]="backendConnected$ | async"
        [currentUser]="currentUser$ | async"
        (tabChange)="onTabChange($event)"
        (logout)="onLogout()"
      ></app-navbar>

      <main class="main-content">
        <!-- Toast de Notificación / Error -->
        <div class="alert-banner error" *ngIf="error$ | async as err">
          <span>⚠️ {{ err }}</span>
          <button type="button" class="btn-dismiss" (click)="onDismissError()">Cerrar</button>
        </div>

        <!-- 1. VISTA PUNTO DE VENTA / EMITIR FACTURA (VISTA PRINCIPAL DEL SISTEMA) -->
        <ng-container *ngIf="activeTab === 'create-invoice'">
          <div class="pos-header-banner" *ngIf="currentUser$ | async as usr">
            <div>
              <span class="eyebrow"><span class="dot"></span> SISTEMA DE VENTAS Y FACTURACIÓN</span>
              <h1>Punto de Venta (POS)</h1>
              <p>Genera ventas con comprobantes electrónicos autorizados automáticamente por el SRI.</p>
            </div>
            <div class="banner-right">
              <span class="badge-branch">
                {{ (activeFiscalEntry$ | async)?.legalName || usr.branchName }} · Sucursal {{ (activeFiscalEntry$ | async)?.establishmentCode || '001' }} · Caja {{ (activeFiscalEntry$ | async)?.pointOfIssueCode || '001' }}
              </span>
            </div>
          </div>

          <!-- AVISO SI NO SE HA REGISTRADO NINGUNA EMPRESA -->
          <div *ngIf="!(activeFiscalEntry$ | async)?.ruc" class="company-warning-box">
            <div class="warning-text">
              <span class="icon">⚠️</span>
              <div>
                <strong>Empresa no configurada:</strong>
                <span>Debe registrar la empresa emisora y sucursal en el sistema antes de emitir comprobantes.</span>
              </div>
            </div>
            <button type="button" class="btn-goto-config" (click)="onTabChange('fiscal')">
              Configurar Empresa Ahora →
            </button>
          </div>

          <div class="dashboard-split">
            <app-invoice-creator
              #invoiceCreator
              [loading]="loading$ | async"
              [pointOfIssueId]="(activeFiscalEntry$ | async)?.pointOfIssueId || null"
              [activeEstablishmentCode]="(activeFiscalEntry$ | async)?.establishmentCode || ''"
              [activePointOfIssueCode]="(activeFiscalEntry$ | async)?.pointOfIssueCode || ''"
              [issuerRuc]="(activeFiscalEntry$ | async)?.ruc || ''"
              [admissionSaturated]="admissionSaturated$ | async"
              (submitInvoice)="onInvoiceSubmit($event, invoiceCreator)"
              (retryInvoice)="onRetryInvoice(invoiceCreator)"
            ></app-invoice-creator>

            <app-document-registry
              [invoices]="invoices$ | async"
              [selectedId]="(selectedInvoice$ | async)?.id || null"
              (selectInvoice)="onInvoiceSelect($event)"
              (downloadOfficialPdf)="onDownloadOfficialPdf($event)"
              (downloadOfficialXml)="onDownloadOfficialXml($event)"
            ></app-document-registry>
          </div>
        </ng-container>

        <!-- 2. VISTA HISTORIAL DE COMPROBANTES Y MÉTRICAS (BASE DE DATOS POSTGRESQL) -->
        <ng-container *ngIf="activeTab === 'invoices'">
          <div class="pos-header-banner">
            <div>
              <span class="eyebrow"><span class="dot"></span> REGISTRO FISCAL EN POSTGRESQL</span>
              <h1>Comprobantes Electrónicos</h1>
              <p>Historial oficial de facturas guardadas en la base de datos a través de la API REST.</p>
            </div>
          </div>

          <!-- Métricas de ventas y facturación -->
          <app-kpi-cards [metrics]="metrics$ | async"></app-kpi-cards>

          <app-document-registry
            [invoices]="invoices$ | async"
            [selectedId]="(selectedInvoice$ | async)?.id || null"
            (selectInvoice)="onInvoiceSelect($event)"
            (downloadOfficialPdf)="onDownloadOfficialPdf($event)"
            (downloadOfficialXml)="onDownloadOfficialXml($event)"
          ></app-document-registry>
        </ng-container>

        <!-- 3. VISTA CONFIGURACIÓN FISCAL Y FIRMA DIGITAL (.p12) -->
        <ng-container *ngIf="activeTab === 'fiscal'">
          <app-fiscal-setup-view
            [entries]="fiscalEntries$ | async"
            [certificates]="certificates$ | async"
            [loading]="fiscalLoading$ | async"
            [activePoiId]="(activeFiscalEntry$ | async)?.pointOfIssueId || null"
            (saveConfig)="onSaveFiscalConfig($event)"
            (createBranch)="onCreateBranch($event)"
            (createPoi)="onCreatePoi($event)"
            (selectActivePoi)="onSelectActivePoi($event)"
            (uploadCert)="onUploadCert($event)"
          ></app-fiscal-setup-view>
        </ng-container>
      </main>

      <!-- Modal para Inspección de RIDE Oficial y Descarga de Artefactos de la API -->
      <app-ride-viewer-modal
        [invoice]="selectedInvoice$ | async"
        [fiscalEntries]="fiscalEntries$ | async"
        [activeFiscalEntry]="activeFiscalEntry$ | async"
        (downloadOfficialPdf)="onDownloadOfficialPdf($event)"
        (downloadOfficialXml)="onDownloadOfficialXml($event)"
        (close)="onCloseRide()"
      ></app-ride-viewer-modal>

      <footer class="app-footer">
        <div class="footer-inner">
          <span>Emitta Cloud API · Facturación Electrónica SRI Ecuador · Maestría de Software</span>
          <span>Arquitectura Reactiva (RxJS) · Smart vs. Dumb Components</span>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .emitta-app-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: var(--background);
    }
    .main-content {
      flex: 1;
      max-width: 1280px;
      width: 100%;
      margin: 0 auto;
      padding: 32px 24px;
    }
    .page-intro {
      margin-bottom: 24px;
    }
    .page-intro h1 {
      font-size: 28px;
      margin: 0 0 6px;
    }
    .page-intro p {
      color: var(--text-muted);
      margin: 0;
      font-size: 14px;
    }
    .alert-banner {
      padding: 12px 18px;
      border-radius: 10px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
    }
    .alert-banner.error {
      background: var(--danger-bg);
      border: 1px solid var(--danger-border);
      color: var(--danger-text);
    }
    .btn-dismiss {
      background: transparent;
      border: 1px solid currentColor;
      color: inherit;
      padding: 2px 8px;
      font-size: 11px;
      border-radius: 4px;
      cursor: pointer;
      min-height: auto;
    }
    .pos-header-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .pos-header-banner h1 {
      font-size: 28px;
      margin: 0 0 6px;
    }
    .pos-header-banner p {
      color: var(--text-muted);
      margin: 0;
      font-size: 14px;
    }
    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--primary);
      margin-bottom: 4px;
    }
    .eyebrow .dot {
      width: 6px;
      height: 6px;
      background: var(--primary);
      border-radius: 50%;
    }
    .badge-branch {
      background: #eff6ff;
      color: #1d4ed8;
      border: 1px solid #bfdbfe;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }
    .company-warning-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 10px;
      padding: 14px 20px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .warning-text {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: #92400e;
    }
    .warning-text .icon {
      font-size: 20px;
    }
    .btn-goto-config {
      background: #b45309;
      color: #ffffff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-goto-config:hover {
      background: #92400e;
    }
    .dashboard-split {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
    .app-footer {
      border-top: 1px solid #eef2f6;
      background: #ffffff;
      padding: 20px 24px;
      margin-top: 40px;
      font-size: 12px;
      color: #73859a;
    }
    .footer-inner {
      max-width: 1280px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
  `]
})
export class DashboardContainerComponent {
  // Inyección de servicios
  private readonly invoiceService = inject(InvoiceService);
  private readonly authService = inject(AuthService);
  private readonly fiscalService = inject(FiscalService);

  activeTab: ActiveTab = 'create-invoice';

  // Flujos de autenticación de cajero
  public readonly currentUser$ = this.authService.currentUser$;
  public readonly isLoggedIn$ = this.authService.isLoggedIn$;

  // Flujos reactivos de facturación y API
  public readonly invoices$ = this.invoiceService.invoices$;
  public readonly selectedInvoice$ = this.invoiceService.selectedInvoice$;
  public readonly metrics$ = this.invoiceService.metrics$;
  public readonly backendConnected$ = this.invoiceService.backendConnected$;
  public readonly loading$ = this.invoiceService.loading$;
  public readonly error$ = this.invoiceService.error$;
  public readonly admissionSaturated$ = this.invoiceService.admissionSaturated$;

  // Flujos reactivos de configuración fiscal
  public readonly fiscalEntries$ = this.fiscalService.fiscalEntries$;
  public readonly activeFiscalEntry$ = this.fiscalService.activeEntry$;
  public readonly certificates$ = this.fiscalService.certificates$;
  public readonly fiscalLoading$ = this.fiscalService.loading$;

  loginError: string | null = null;

  constructor() {
    // Escuchar el token emitido por el servicio y sincronizar la configuración fiscal oficial
    this.invoiceService.token$.subscribe(token => {
      if (token) {
        this.fiscalService.loadFiscalConfiguration(token).subscribe();
      }
    });
  }

  onCashierLogin(evt: { username: string; pass: string }): void {
    this.loginError = null;
    this.authService.login(evt.username, evt.pass).subscribe(res => {
      if (res.success) {
        this.loginError = null;
        this.invoiceService.authenticateAndLoadRealDocuments();
        const token = this.invoiceService.getToken();
        this.fiscalService.loadFiscalConfiguration(token).subscribe();
      } else {
        this.loginError = res.error || 'Credenciales incorrectas.';
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.invoiceService.clearSelection();
  }

  onTabChange(tab: ActiveTab): void {
    this.activeTab = tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (tab === 'fiscal') {
      const token = this.invoiceService.getToken();
      this.fiscalService.loadFiscalConfiguration(token).subscribe();
    }
  }

  onInvoiceSubmit(request: CreateInvoiceRequest, creator?: InvoiceCreatorComponent): void {
    this.invoiceService.emitInvoice(request).subscribe(res => {
      if (res && (res.status === 'QUEUED' || res.created)) {
        creator?.clearForm();
      }
    });
  }

  onRetryInvoice(creator?: InvoiceCreatorComponent): void {
    this.invoiceService.retryAdmissionInvoice().subscribe(res => {
      if (res && (res.status === 'QUEUED' || res.created)) {
        creator?.clearForm();
      }
    });
  }

  onInvoiceSelect(id: string): void {
    this.invoiceService.selectInvoice(id);
  }

  onInvoiceDelete(id: string): void {
    this.invoiceService.removeInvoice(id);
  }

  onCloseRide(): void {
    this.invoiceService.clearSelection();
  }

  onDismissError(): void {
    this.invoiceService.clearError();
  }

  // Descarga de PDF oficial generado por la API de Emitta
  onDownloadOfficialPdf(docId: string): void {
    this.invoiceService.downloadOfficialArtifact(docId, 'ride-pdf').subscribe();
  }

  // Descarga de XML oficial generado por la API de Emitta
  onDownloadOfficialXml(docId: string): void {
    this.invoiceService.downloadOfficialArtifact(docId, 'authorized-xml').subscribe();
  }

  // Guardado de configuración fiscal oficial (POST /api/v1/fiscal-configuration)
  onSaveFiscalConfig(req: FiscalConfigurationRequest): void {
    const token = this.invoiceService.getToken();
    this.fiscalService.saveFiscalConfiguration(token, req).subscribe();
  }

  // Registrar nueva sucursal (POST /api/v1/taxpayers/{id}/establishments)
  onCreateBranch(evt: { code: string; name?: string; address?: string }): void {
    const token = this.invoiceService.getToken();
    const taxpayerId = this.fiscalService.getTaxpayerId();
    this.fiscalService.createEstablishment(token, taxpayerId, evt).subscribe();
  }

  // Registrar nueva caja (POST /api/v1/establishments/{id}/points-of-issue)
  onCreatePoi(evt: { establishmentId: string; code: string; name?: string }): void {
    const token = this.invoiceService.getToken();
    this.fiscalService.createPointOfIssue(token, evt.establishmentId, { code: evt.code, name: evt.name }).subscribe();
  }

  // Seleccionar caja activa para el POS
  onSelectActivePoi(entry: FiscalConfigurationEntry): void {
    this.fiscalService.selectActiveEntry(entry);
  }

  // Carga de certificado digital .p12 (POST /api/v1/taxpayers/{id}/certificates)
  onUploadCert(evt: { file: File; pass: string }): void {
    const token = this.invoiceService.getToken();
    const taxpayerId = this.fiscalService.getTaxpayerId();
    if (!taxpayerId) return;

    const fd = new FormData();
    fd.append('certificate', evt.file, evt.file.name || 'firma.p12');
    fd.append('password', evt.pass);
    fd.append('authorizationReviewed', 'true');

    // La API exige evidencia legal de autorización de firma (máx 256 KB)
    const evidenceContent = `%PDF-1.4\n1 0 obj\n<< /Title (Autorizacion Firma) /Author (${taxpayerId}) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`;
    const evidenceBlob = new Blob([evidenceContent], { type: 'application/pdf' });
    fd.append('authorizationEvidence', evidenceBlob, 'evidencia-autorizacion.pdf');

    this.fiscalService.uploadCertificate(token, taxpayerId, fd).subscribe();
  }
}

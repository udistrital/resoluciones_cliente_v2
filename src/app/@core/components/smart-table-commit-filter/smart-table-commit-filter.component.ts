import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-smart-table-commit-filter',
  template: `
    <div class="smart-filter">
      <div class="smart-filter-control" [class.smart-filter-active]="tieneFiltroActivo()">
        <input
          [ngClass]="inputClass"
          [(ngModel)]="value"
          class="form-control smart-filter-input"
          type="text"
          [placeholder]="getPlaceholder()"
          [title]="getTooltip()"
          (keydown.enter)="applyFilter()"
          (blur)="applyFilter()" />

        <button
          *ngIf="value"
          type="button"
          class="smart-filter-icon smart-filter-clear"
          title="Limpiar filtro"
          (click)="clearFilter()">
          ×
        </button>

        <button
          type="button"
          class="smart-filter-icon smart-filter-apply"
          title="Aplicar filtro"
          (click)="applyFilter()">
          <mat-icon>search</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .smart-filter {
      width: 100%;
    }

    .smart-filter-control {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }

    .smart-filter-input {
      width: 100%;
      min-width: 0;
      padding-right: 4.2rem;
      border: 1px solid #d7dbe2;
      border-radius: 4px;
      background: #fff;
      transition: border-color .15s ease, box-shadow .15s ease, background-color .15s ease;
    }

    .smart-filter-control.smart-filter-active .smart-filter-input {
      border-color: #8b1e1e;
      background: #fff7f5;
      box-shadow: inset 0 0 0 1px rgba(139, 30, 30, 0.08);
      font-weight: 600;
      color: #5a1414;
    }

    .smart-filter-input::placeholder {
      color: #8a8f98;
      opacity: 1;
    }

    .smart-filter-icon {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      border: none;
      background: transparent;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      color: #8b1e1e;
    }

    .smart-filter-apply {
      right: 0.35rem;
      width: 1.6rem;
      height: 1.6rem;
      border-radius: 50%;
      background: rgba(139, 30, 30, 0.1);
    }

    .smart-filter-clear {
      right: 2.05rem;
      width: 1.1rem;
      height: 1.1rem;
      font-size: 1rem;
      line-height: 1;
      color: #a34a4a;
    }

    .smart-filter-icon:hover {
      color: #5f1111;
    }

    .smart-filter-apply:hover {
      background: rgba(139, 30, 30, 0.18);
    }

    .smart-filter-apply .mat-icon {
      width: 1rem;
      height: 1rem;
      font-size: 1rem;
      line-height: 1rem;
    }
  `],
})
export class SmartTableCommitFilterComponent implements OnChanges {
  @Input() query = '';
  @Input() inputClass = '';
  @Input() column: any;
  @Input() source: any;
  @Output() filter = new EventEmitter<string>();

  value = '';
  private ultimoValorEmitido = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.query || changes.source || changes.column) {
      this.sincronizarValorActual();
    }
  }

  getPlaceholder(): string {
    const titulo = this.column?.title || 'Filtrar';
    return this.tieneFiltroActivo() ? `Filtrado: ${this.value}` : titulo;
  }

  getTooltip(): string {
    return this.tieneFiltroActivo()
      ? `Filtro activo: ${this.value}`
      : 'Escriba un valor y aplique con Enter o con la lupa';
  }

  tieneFiltroActivo(): boolean {
    return !!this.value.trim();
  }

  applyFilter(): void {
    const valor = (this.value || '').trim();

    if (valor === this.ultimoValorEmitido) {
      return;
    }

    this.ultimoValorEmitido = valor;
    this.filter.emit(valor);
  }

  clearFilter(): void {
    this.value = '';
    this.ultimoValorEmitido = '';
    this.filter.emit('');
  }

  private sincronizarValorActual(): void {
    const valorDesdeSource = this.obtenerFiltroActualDesdeSource();
    const valor = valorDesdeSource !== '' ? valorDesdeSource : (this.query || '');

    this.value = valor;
    this.ultimoValorEmitido = valor;
  }

  private obtenerFiltroActualDesdeSource(): string {
    if (!this.source || !this.column?.id || typeof this.source.getFilter !== 'function') {
      return '';
    }

    const filterConf = this.source.getFilter();
    const filters = filterConf?.filters || [];
    const actual = filters.find((item: any) => item?.field === this.column.id);

    return actual?.search ? String(actual.search) : '';
  }
}

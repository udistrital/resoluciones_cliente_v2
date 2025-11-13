import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Resoluciones } from '../../models/resoluciones';

@Component({
  selector: 'app-actions-assistance',
  templateUrl: './actions-assistance.component.html',
  styleUrls: ['./actions-assistance.component.scss']
})
export class ActionsAssistanceComponent implements OnInit {

  @Input() rowData: Resoluciones;
  modulo: string;

  @Output() icon: EventEmitter<string> = new EventEmitter();
  @Output() data: EventEmitter<Resoluciones> = new EventEmitter();

  mostrarRp: boolean = false;
  mostrarBotonesGestion: boolean = false;

  constructor() { }

  ngOnInit(): void {
    const encodedUser = localStorage.getItem('user') || '';
    let user: any = null;

    try {
      user = JSON.parse(atob(encodedUser));
    } catch (e) {
      console.error('Error decoding user data', e);
    }

    const roles = user?.user?.role || [];

    this.mostrarBotonesGestion =
      roles.includes('ASISTENTE_DECANATURA') ||
      roles.includes('DECANO') ||
      roles.includes('ADMINISTRADOR_RESOLUCIONES');

    this.mostrarRp =
      roles.includes('ADMINISTRADOR_RESOLUCIONES') ||
      roles.includes('ASIS_FINANCIERA');
  }

  iconoSelect(event: string): void {
    this.icon.emit(event);
    this.data.emit(this.rowData);
  }

}

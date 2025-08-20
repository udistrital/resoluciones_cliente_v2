import { Component, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

type Kind = 'all' | 'pdf' | 'video';

interface ManualItem {
  txt: string;
  url: string;
  tipo: 'pdf' | 'video';
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent {
  // Estado / filtros
  q = '';
  kind: Kind = 'all';

col1: ManualItem[] = [
  { txt: 'Gestión de resoluciones', url: 'https://ti.udistrital.edu.co/sites/default/files/documentacion/2023-07/Gesti%c3%b3n%20de%20Resoluciones%20v2.pdf', tipo: 'pdf' },
  { txt: 'Aprobación de resoluciones V2', url: 'https://youtu.be/ThVonSWaLbo', tipo: 'video' },
  { txt: 'Administrador de Resoluciones V2', url: 'https://youtu.be/JW8skIvsLq8', tipo: 'video' },
];

col2: ManualItem[] = [
  { txt: 'Gestión de plantillas V2', url: 'https://youtu.be/XteGm4iIvHo', tipo: 'video' },
  { txt: 'Gestión de vinculaciones V2', url: 'https://youtu.be/WOhCY_94cA0', tipo: 'video' },
  //  Este último aún no tiene URL real, toca crear short de YouTube
  // { txt: 'Módulo de reportes financieros', url: '#', tipo: 'video' },
];

  constructor(private dialog: MatDialog) {}

  openManuales(tpl: TemplateRef<unknown>) {
    this.dialog.open(tpl, {
      width: '920px',
      maxWidth: '96vw',
      maxHeight: '90vh',
      panelClass: 'manuales-modern', // <-- clase para los estilos nuevos
    });
  }

  setKind(k: Kind) {
    this.kind = k;
  }

  filtered(arr: ManualItem[]) {
    const q = this.q.trim().toLowerCase();
    return arr.filter((item) => {
      const matchesKind = this.kind === 'all' ? true : item.tipo === this.kind;
      const matchesText = !q ? true : item.txt.toLowerCase().includes(q);
      return matchesKind && matchesText;
    });
  }
}

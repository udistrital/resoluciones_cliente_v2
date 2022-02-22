import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-detalle-resolucion',
  templateUrl: './detalle-resolucion.component.html',
  styles: ['.gestion-title { text-align: center; }']
})
export class DetalleResolucionComponent implements OnInit {

  resolucionId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      if (params.get('Id') !== null) {
        this.resolucionId = Number(params.get('Id'));
      }
    });
  }

  volver(): void {
    this.router.navigateByUrl('pages/gestion_resoluciones');
  }

}

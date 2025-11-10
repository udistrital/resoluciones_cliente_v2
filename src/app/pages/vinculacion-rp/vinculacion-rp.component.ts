import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequestManager } from '../services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-vinculacion-rp',
  templateUrl: './vinculacion-rp.component.html',
  styleUrls: ['./vinculacion-rp.component.scss'],
  animations: [
    trigger('fadeResult', [
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      state('hidden', style({ opacity: 0, transform: 'translateY(-10px)' })),
      transition('hidden => visible', [animate('400ms ease-in')]),
      transition('visible => hidden', [animate('400ms ease-out')])
    ])
  ]
})
export class VinculacionRpComponent implements OnInit {

  form!: FormGroup;
  archivo: File | null = null;
  cargando = false;
  resultado: any = null;
  aniosDisponibles: number[] = [];
  estadoAnimacion: 'visible' | 'hidden' = 'hidden';

  constructor(
    private fb: FormBuilder,
    private request: RequestManager
  ) {}

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    this.aniosDisponibles = [currentYear - 1, currentYear, currentYear + 1];

    this.form = this.fb.group({
      vigenciaRp: ['', [Validators.required]],
      file: [null, [Validators.required]]
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext !== 'xlsx') {
        Swal.fire('Formato inválido', 'Solo se permiten archivos Excel (.xlsx).', 'error');
        return;
      }
      this.archivo = file;
      this.form.patchValue({ file });
    }
  }

  descargarPlantilla(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
      const link = document.createElement('a');
    link.href = 'assets/plantillas/plantilla_rp.xlsx';
    link.download = 'plantilla_rp.xlsx';
    link.click();
  }

  abrirGuia(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
      Swal.fire({
      title: 'Estructura esperada del archivo Excel',
      html: `
        <div style="max-height: 60vh; overflow-y: auto; text-align: center; font-family: 'Inter', sans-serif;">
          <table border="1" style="
            width: 100%;
            border-collapse: collapse;
            margin: 1rem auto;
            font-size: 0.9rem;
            table-layout: auto;
            word-wrap: break-word;
          ">
            <thead style="background:#731514; color:#fff;">
              <tr>
                <th style="padding:8px 6px;">Vigencia</th>
                <th style="padding:8px 6px;">CDP</th>
                <th style="padding:8px 6px;">CRP</th>
                <th style="padding:8px 6px;">Documento</th>
                <th style="padding:8px 6px;">Valor</th>
                <th style="padding:8px 6px;">Cod Proyecto</th>
                <th style="padding:8px 6px;">Proyecto Curricular</th>
                <th style="padding:8px 6px;">Cod Resolución</th>
                <th style="padding:8px 6px;">Cod Facultad</th>
              </tr>
            </thead>
          </table>
          <p style="color:#444; margin-top:12px; font-size:13px;">
            Asegúrate de incluir todos los encabezados tal como se muestran.<br>
            <strong>No cambies los nombres de las columnas</strong> para evitar errores en la carga.
          </p>
          <button id="descargar-plantilla" style="
            background-color:#731514;
            color:#fff;
            border:none;
            border-radius:6px;
            padding:8px 18px;
            margin-top:12px;
            cursor:pointer;
            font-weight:500;
          ">
            📥 Descargar plantilla Excel
          </button>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#731514',
      width: '75%',
      didOpen: () => {
        const btn = document.getElementById('descargar-plantilla');
        if (btn) {
          btn.addEventListener('click', () => {
            const link = document.createElement('a');
            link.href = 'assets/plantillas/plantilla_rp.xlsx';
            link.download = 'plantilla_rp.xlsx';
            link.click();
          });
        }
      }
    });
  }

  onSubmit(): void {
    if (!this.form.value.vigenciaRp) {
      Swal.fire('Vigencia requerida', 'Selecciona el año de la vigencia antes de continuar.', 'warning');
      return;
    }

    if (!this.archivo) {
      Swal.fire('Archivo requerido', 'Debes seleccionar un archivo Excel (.xlsx) válido.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.archivo);
    formData.append('vigenciaRp', this.form.value.vigenciaRp);

    this.cargando = true;
    this.estadoAnimacion = 'hidden';

    Swal.fire({
      title: 'Procesando archivo...',
      text: 'Por favor espere mientras se cargan los RPs.',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    this.request.post(environment.RESOLUCIONES_MID_V2_SERVICE, 'vinculacion_rp/', formData)
      .subscribe({
        next: (res: any) => {
          this.cargando = false;
          Swal.close();

          if (res?.Error) {
            Swal.fire({
              title: 'Error en el archivo',
              text: res.Error,
              icon: 'error',
              confirmButtonColor: '#731514'
            });
            this.resetForm();
            return;
          }

          if (res?.Success && res?.Data) {
            const data = res.Data;

            const procesados = data.filter((x: any) => x.put_status === 'OK').length;
            const errores = data.filter((x: any) => x.put_status?.toLowerCase().includes('error')).length;
            const omitidos = data.filter((x: any) =>
              x.put_status && !x.put_status.toLowerCase().includes('ok') && !x.put_status.toLowerCase().includes('error')
            ).length;

            const detalles = data.map((x: any) => {
              const crp = x.crp || '(sin CRP)';
              const resol = (x.cod_resolucion || '').replace(/'/g, '') || '(sin resolución)';
              const estado = x.put_status?.toLowerCase().includes('ok')
                ? 'fue registrado correctamente'
                : `no fue registrado (${x.put_status || 'sin detalle'})`;
              return `El CRP <strong>${crp}</strong> de la resolución <strong>${resol}</strong> ${estado}.`;
            });

            this.resultado = { procesados, omitidos, errores, detalles };
            this.estadoAnimacion = 'visible';

            Swal.fire({
              title: 'Procesamiento completado',
              text: res.Message || 'El archivo fue procesado correctamente.',
              icon: 'success',
              confirmButtonColor: '#731514'
            });

            this.form.reset();
            this.archivo = null;
            const fileInput = document.getElementById('file') as HTMLInputElement;
            if (fileInput) {
              fileInput.value = '';
            }
          } else {
            Swal.fire('Sin resultados', res?.Message || 'No se encontraron filas procesadas.', 'info');
            this.resetForm();
          }
        },
        error: (err) => {
          this.cargando = false;
          Swal.close();
          const msg = err.error?.Error || err.error?.Message || 'Error desconocido al procesar el archivo.';
          Swal.fire({
            title: 'Error en la carga',
            text: msg,
            icon: 'error',
            confirmButtonColor: '#731514'
          });
          this.resetForm();
        }
      });
  }

  resetForm(): void {
    this.form.reset();
    this.archivo = null;
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}

import { HttpClient } from '@angular/common/http';
import { ServerDataSource } from 'ng2-smart-table';
import { ServerSourceConf } from 'ng2-smart-table/lib/lib/data-source/server/server-source.conf';
import { Observable, finalize } from 'rxjs';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { UtilService } from 'src/app/pages/services/utilService';

export class ResolucionesDataSourceComponent extends ServerDataSource {

  constructor(
    protected http: HttpClient,
    protected popUp: UtilService,
    protected request: RequestManager,
    protected filtroInicial: string,
    protected conf: ServerSourceConf | any,
  ) {
    super(http, conf);
  }

  protected requestElements(): Observable<any> {
    const endpoint = `${this.conf.endPoint}?${this.createRequesParams().toString()}&${this.filtroInicial}`;
    let request: Observable<any>;
    this.request.header$.subscribe(header => {
      header['observe'] = 'response';
      this.popUp.loading();
      request = this.http.get<any>(endpoint, header).pipe(
        finalize(() => this.popUp.close()),
      );
    });
    return request;
  }
}

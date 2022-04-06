import { HttpClient } from '@angular/common/http';
import { ServerDataSource } from 'ng2-smart-table';
import { ServerSourceConf } from 'ng2-smart-table/lib/lib/data-source/server/server-source.conf';
import { mergeMap, Observable } from 'rxjs';
import { RequestManager } from 'src/app/pages/services/requestManager';

export class ResolucionesDataSourceComponent extends ServerDataSource {

  constructor(
    protected http: HttpClient,
    protected request: RequestManager,
    protected conf: ServerSourceConf | any,
  ) {
    super(http, conf);
  }

  protected requestElements(): Observable<any> {
    const endpoint = `${this.conf.endPoint}&${this.createRequesParams().toString()}`;
    let request: Observable<any>;
    this.request.header$.subscribe(header => {
      header['observe'] = 'response';
      request = this.http.get<any>(endpoint, header);
    });
    return request;
  }
}

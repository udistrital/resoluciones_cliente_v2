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
    const httpParams = this.createRequesParams();
    let request: Observable<any>
    this.request.header$.subscribe(header => {
      request = this.http.get<any>(this.conf.endPoint, {headers: header, observe: 'response', params: httpParams});
    });
    return request;
  }
}

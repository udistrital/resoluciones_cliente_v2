import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { HttpErrorManager } from './errorManager';
import { BehaviorSubject, Observable } from 'rxjs';
import { retry } from 'rxjs/operators';

/**
 * This class manage the http connections with internal REST services. Use the response format {
 *  Code: 'xxxxx',
 *  Body: 'Some Data' (this element is returned if the request is success)
 *  ...
 * }
 */
@Injectable({
  providedIn: 'root',
})
export class RequestManager {
  private headerSubject = new BehaviorSubject({});
  public header$ = this.headerSubject.asObservable();

  constructor(private http: HttpClient, private errManager: HttpErrorManager) {
    this.updateHeaderToken();
  }

  updateHeaderToken(): void {
    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      this.headerSubject.next({
        headers: new HttpHeaders({
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        })
      });
    }
  }



  /**
   * Perform a GET http request
   *
   * @param path service's path from environment end-point
   * @param endpoint service's end-point
   * @param params (an Key, Value object with que query params for the request)
   * @returns Observable<any>
   */
  get(path, endpoint): Observable<any> {
    return this.header$.pipe(
      mergeMap(header => {
        header['observe'] = 'body';
        return this.http.get<any>(`${path}${endpoint}`, header).pipe(
          map(
            (res: any) => {
              if (res.hasOwnProperty('Body')) {
                return res.Body;
              } else {
                return res;
              }
            },
          ),
          retry(2),
          catchError(this.errManager.handleError.bind(this)),
        );
      })
    );
  }

  /**
   * Perform a POST http request
   *
   * @param path service's path from environment end-point
   * @param endpoint service's end-point
   * @param element data to send as JSON
   * @returns Observable<any>
   */
  post(path, endpoint, element): Observable<any> {
    return this.header$.pipe(
      mergeMap(header => {
        header['observe'] = 'body';
        return this.http.post<any>(`${path}${endpoint}`, element, header).pipe(
          catchError(this.errManager.handleError)
        );
      })
    );
  }

  /**
   * Perform a PUT http request
   *
   * @param path service's path from environment end-point
   * @param endpoint service's end-point
   * @param element data to send as JSON, With the id to UPDATE
   * @returns Observable<any>
   */
  put(path, endpoint, element, id): Observable<any> {
    return this.header$.pipe(
      mergeMap(header => {
        header['observe'] = 'body';
        return this.http.put<any>(`${path}${endpoint}/${id}`, element, header).pipe(
          catchError(this.errManager.handleError),
        );
      })
    );
  }

  /**
   * Perform a DELETE http request
   *
   * @param path service's path from environment end-point
   * @param endpoint service's end-point
   * @param id element's id for remove
   * @returns Observable<any>
   */
  delete(path, endpoint, id): Observable<any> {
    return this.header$.pipe(
      mergeMap(header => {
        header['observe'] = 'body';
        return this.http.delete<any>(`${path}${endpoint}/${id}`, header).pipe(
          catchError(this.errManager.handleError),
        );
      })
    );
  }
}

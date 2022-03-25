import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Injectable, forwardRef, Inject, NgZone } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class HttpErrorManager {
  constructor(
   ) {}

  public handleError(error: HttpErrorResponse): Observable<Error> {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,

      console.error(`Backend returned code ${error.status ? error.status : 'no code'}, ` + `result was: ${error.message}`);
    }
    // return an observable with a user-facing error message
    return throwError(() => {
      return new Error(error.message);
    });
  }
}

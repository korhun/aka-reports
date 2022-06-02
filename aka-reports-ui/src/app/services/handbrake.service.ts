import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, of, debounceTime } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { HandbrakeItem, HandbrakeHelper, HandbrakeSearchOptions, HandbrakeSearchResult } from "../models/handbrake-item.model";

@Injectable({
  providedIn: 'root'
})
export class HandbrakeService {

  constructor(private http: HttpClient) {

  }


  private _findHandbrakes(options: HandbrakeSearchOptions): Observable<any> {
    return this.http.get('/api/handbrakes', {
      params: new HttpParams()
        .set('options', JSON.stringify(options))
    });
  }

  findHandbrakes(options: HandbrakeSearchOptions): Observable<HandbrakeSearchResult> {
    return this._findHandbrakes(options).pipe(
      map(items => HandbrakeHelper.getHandbrakeSearchResult(items))
    )
  }
}

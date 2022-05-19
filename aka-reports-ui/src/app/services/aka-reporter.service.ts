import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { HandbrakeItem, HandbrakeItemHelper } from '../models/handbrake-item.model';

// const httpOptions = { headers: new HttpHeaders() }
@Injectable({
  providedIn: 'root'
})
export class AkaReporterService {
  private static _search_url: string = `api/handbrake`;

  constructor(private http: HttpClient) { }
  validate(item: HandbrakeItem): HandbrakeItem {
    if (item)
      HandbrakeItemHelper.validate(item);
    return item;
  }

  searchBarcodes(search_text: string, limit: number = 50): Observable<string[]> {
    let data = {
      search_text: search_text,
      limit: limit,
      options: ["only_barcode"]
    };
    return this.http.get<string[]>(AkaReporterService._search_url, {params: data});
  }
  searchHandbrakes(search_text: string, limit: number = 50): Observable<HandbrakeItem[]> {
    let data = {
      search_text: search_text,
      limit: limit
    };
    return this.http.get<HandbrakeItem[]>(AkaReporterService._search_url, {params: data}).pipe(
      map((items: HandbrakeItem[]) => items.map(item => this.validate(item)))
    );

    // const limitTxt: String = limit > 0 ? `?limit=${limit}` : ""
    // const url: string = `${AkaReporterService._search_url}${limitTxt}`
    // return this.http.get<HandbrakeItem[]>(url).pipe(
    //   map((items: HandbrakeItem[]) => items.map(item => this.validate(item)))
    // );
  }
}

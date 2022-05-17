import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const httpOptions = { headers: new HttpHeaders() }
@Injectable({
  providedIn: 'root'
})
export class AkaReporterService {
  _url: string = `api/reporter`;

  constructor(private http: HttpClient) { }

  search(limit: number = 50): Observable<Project[]> {
    const limitTxt: String = limit > 0 ? `?limit=${limit}` : ""
    const url: string = `${AkaReporterService._url}${limitTxt}`
    return this.http.get<Project[]>(url).pipe(
      map((projects: Project[]) => projects.map(prj => this.validate(prj)))
    );
  }
}

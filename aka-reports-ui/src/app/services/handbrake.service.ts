import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, of, debounceTime } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { HandbrakeItem, HandbrakeHelper, HandbrakeSearchOptions } from "../models/handbrake-item.model";

@Injectable({
  providedIn: 'root'
})
export class HandbrakeService {

  constructor(private http: HttpClient) {

  }

  // findCourseById(courseId: number): Observable<Course> {
  //     return this.http.get<Course>(`/api/courses/${courseId}`);
  // }

  // findAllCourses(): Observable<Course[]> {
  //     return this.http.get('/api/courses')
  //         .pipe(
  //             map(res => res['payload'])
  //         );
  // }

  // findAllCourseLessons(courseId:number): Observable<Lesson[]> {
  //     return this.http.get('/api/lessons', {
  //         params: new HttpParams()
  //             .set('courseId', courseId.toString())
  //             .set('pageNumber', "0")
  //             .set('pageSize', "1000")
  //     }).pipe(
  //         map(res =>  res["payload"])
  //     );
  // }

  private subscriptionHandbrake!: any;


  private _findHandbrakes(options: HandbrakeSearchOptions): Observable<any> {
    return this.http.get('/api/handbrake', {
      params: new HttpParams()
        .set('options', JSON.stringify(options))
    });
  }

  findHandbrakes(options: HandbrakeSearchOptions): Observable<HandbrakeItem[]> {
    return this._findHandbrakes(options).pipe(
      map(items => HandbrakeHelper.getHandbrakeItems(items))
    )
  }
  findHandbrakesCount(options: HandbrakeSearchOptions): Observable<number> {
    return this._findHandbrakes(HandbrakeHelper.createOptionsForCount(options)).pipe(
      map(count => +count)
    )
  }
}

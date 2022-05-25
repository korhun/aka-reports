import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { HandbrakeItem, HandbrakeItemHelper } from "../models/handbrake-item.model";

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


  findHandbrakes(barcodeFilter = '', sortOrder = 'asc', pageNumber = 0, pageSize = 3): Observable<HandbrakeItem[]> {
    return this.http.get('/api/handbrake', {
      params: new HttpParams()
        .set('barcodeFilter', barcodeFilter)
        .set('sortOrder', sortOrder)
        .set('pageNumber', pageNumber.toString())
        .set('pageSize', pageSize.toString())
    }).pipe(
      // map(res => HandbrakeItemHelper.getHandbrakeItems(res))
      map(items => HandbrakeItemHelper.getHandbrakeItems(items))
      // map((items: HandbrakeItem[]) => items.map(item => HandbrakeItemHelper.validate(item)))
    );
  }
  findHandbrakesCount(barcodeFilter = ''): Observable<object> {
    return this.http.get('/api/handbrake', {
      params: new HttpParams()
        .set('barcodeFilter', barcodeFilter)
        .set('options', "only_count")
    });
  }

  // findHandbrakes(
  //   courseId: number, filter = '', sortOrder = 'asc',
  //   pageNumber = 0, pageSize = 3): Observable<HandbrakeItem[]> {

  //   return this.http.get('/api/lessons', {
  //     params: new HttpParams()
  //       .set('courseId', courseId.toString())
  //       .set('filter', filter)
  //       .set('sortOrder', sortOrder)
  //       .set('pageNumber', pageNumber.toString())
  //       .set('pageSize', pageSize.toString())
  //   }).pipe(
  //     map(res => res["payload"])
  //   );
  // }


}

import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { Observable, BehaviorSubject, of, Subscription } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { HandbrakeHelper, HandbrakeItem, HandbrakeSearchOptions } from "../models/handbrake-item.model";
import { HandbrakeService } from "./handbrake.service";



export class HandbrakeDataSource implements DataSource<HandbrakeItem> {

  private handbrakesSubject = new BehaviorSubject<HandbrakeItem[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private lengthSubject = new BehaviorSubject<number>(0);

  public loading$ = this.loadingSubject.asObservable();
  public length$ = this.lengthSubject.asObservable();

  constructor(private handbrakeService: HandbrakeService) {

  }

  private subs!: Subscription;
  loadHandbrakes(options: HandbrakeSearchOptions) {
    this.loadingSubject.next(true);
    if (this.subs)
      this.subs.unsubscribe();
    this.subs = this.handbrakeService.findHandbrakes(options).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(handbrakes => this.handbrakesSubject.next(handbrakes));

    this.handbrakeService.findHandbrakesCount(options).pipe(
      catchError(() => of([])),
    ).subscribe(count => this.lengthSubject.next(+count));



    // this.loadingSubject.next(true);
    // this.handbrakeService.findHandbrakes(options).pipe(
    //   catchError(() => of([])),
    //   finalize(() => this.loadingSubject.next(false))
    // ).subscribe(handbrakes => this.handbrakesSubject.next(handbrakes));

    // this.handbrakeService.findHandbrakesCount(options).pipe(
    //   catchError(() => of([])),
    // ).subscribe(count => this.lengthSubject.next(+count));
  }

  connect(collectionViewer: CollectionViewer): Observable<HandbrakeItem[]> {
    console.log("Connecting data source");
    return this.handbrakesSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.handbrakesSubject.complete();
    this.loadingSubject.complete();
  }

}


import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { Observable, BehaviorSubject, of, Subscription } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { HandbrakeHelper, HandbrakeItem, HandbrakeSearchOptions, HandbrakeSearchResult } from "../models/handbrake-item.model";
import { HandbrakeService } from "./handbrake.service";



export class HandbrakeDataSource implements DataSource<HandbrakeItem> {

  private handbrakesSubject = new BehaviorSubject<HandbrakeItem[]>([]);

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  private lengthSubject = new BehaviorSubject<number>(0);
  public length$ = this.lengthSubject.asObservable();

  private faultResultsSubject = new BehaviorSubject<any[]>([]);
  public faultResults$ = this.faultResultsSubject.asObservable();

  private faultCountSubject = new BehaviorSubject<number>(0);
  public faultCount$ = this.faultCountSubject.asObservable();

  private noFaultCountSubject = new BehaviorSubject<number>(0);
  public noFaultCount$ = this.noFaultCountSubject.asObservable();



  private typeResultsSubject = new BehaviorSubject<any[]>([]);
  public typeResults$ = this.typeResultsSubject.asObservable();

  private typeCrmCountSubject = new BehaviorSubject<number>(0);
  public typeCrmCount$ = this.typeCrmCountSubject.asObservable();

  private typeBlkCountSubject = new BehaviorSubject<number>(0);
  public typeBlkCount$ = this.typeBlkCountSubject.asObservable();

  private typeUnknownCountSubject = new BehaviorSubject<number>(0);
  public typeUnknownCount$ = this.typeUnknownCountSubject.asObservable();


  private countSeriesSubject = new BehaviorSubject<any[]>([]);
  public countSeries$ = this.countSeriesSubject.asObservable();

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
    )
    .subscribe(obj => {
      const res = obj as HandbrakeSearchResult;
      this.handbrakesSubject.next(res.handbrakes);
      this.lengthSubject.next(res.count);

      this.faultResultsSubject.next(res.fault_results);
      this.faultCountSubject.next(res.fault_results[0]["value"]);
      this.noFaultCountSubject.next(res.fault_results[1]["value"]);

      this.typeResultsSubject.next(res.type_results);
      this.typeCrmCountSubject.next(res.type_results[0]["value"]);
      this.typeBlkCountSubject.next(res.type_results[1]["value"]);
      this.typeUnknownCountSubject.next(res.type_results[2]["value"]);

      this.countSeriesSubject.next(res.count_series);
    })
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


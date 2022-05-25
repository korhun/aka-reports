import { CollectionViewer, DataSource } from "@angular/cdk/collections";
import { Observable, BehaviorSubject, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";
import { HandbrakeItem } from "../models/handbrake-item.model";
import { HandbrakeService } from "./handbrake.service";



export class HandbrakeDataSource implements DataSource<HandbrakeItem> {

  private handbrakesSubject = new BehaviorSubject<HandbrakeItem[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private lengthSubject = new BehaviorSubject<number>(0);

  public loading$ = this.loadingSubject.asObservable();

  public length$ = this.lengthSubject.asObservable();

  constructor(private handbrakeService: HandbrakeService) {

  }

  loadHandbrakes(barcodeFilter: string, sortDirection: string, pageIndex: number, pageSize: number) {
    this.loadingSubject.next(true);
    if (barcodeFilter == null)
      barcodeFilter = ""
    this.handbrakeService.findHandbrakes(barcodeFilter, sortDirection, pageIndex, pageSize).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(handbrakes => this.handbrakesSubject.next(handbrakes));

    this.handbrakeService.findHandbrakesCount(barcodeFilter).pipe(
      catchError(() => of([]))
    ).subscribe(len => this.lengthSubject.next(+len));
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


import { Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize } from "rxjs/operators";
import { CamDetails, HandbrakeDetails, HandbrakeHelper, HandbrakeItem } from 'src/app/models/handbrake-item.model';
import { HandbrakeService } from 'src/app/services/handbrake.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-handbrake-details',
  templateUrl: './handbrake-details.component.html',
  styleUrls: ['./handbrake-details.component.scss']
})
export class HandbrakeDetailsComponent implements OnInit {

  // @Input() handbrakeItem!: HandbrakeItem

  constructor(private handbrakeService: HandbrakeService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
  }

  // handbrakeItem!: HandbrakeItem
  // handbrakeDetails!: HandbrakeDetails
  // private handbrakeDetailsSubject = new BehaviorSubject<HandbrakeDetails>(HandbrakeHelper.createDefaultHandbrakeDetails());
  // public handbrakeDetails$ = this.handbrakeDetailsSubject.asObservable();

  // private camsSubject: BehaviorSubject<Array<CamDetails>> = new BehaviorSubject<Array<CamDetails>>([]);
  // public cams$: Observable<Array<CamDetails>> = this.camsSubject.asObservable();

  private imgPathsSubject: BehaviorSubject<Array<string>> = new BehaviorSubject<Array<string>>([]);
  public imgPaths$: Observable<Array<string>> = this.imgPathsSubject.asObservable();

  private subs!: Subscription;

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  load(handbrakeItem: HandbrakeItem) {
    // this.handbrakeItem = handbrakeItem

    this.loadingSubject.next(true);
    if (this.subs)
      this.subs.unsubscribe();

    this.handbrakeService.getHandbrakeDetails(handbrakeItem.key).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    )
      .subscribe(obj => {
        const details = obj as HandbrakeDetails
        // this.handbrakeDetailsSubject.next(details)
        // this.camsSubject.next(details.cams)

        const imagePaths: Array<any> = [];
        for (let key in details.cams) {
          const base64Txt: string = details.cams[key].preview;
          // const imgPath = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpg;base64,' + base64Txt);
          const imgPath = base64Txt;
          console.log(imgPath)
          imagePaths.push(imgPath);
        }

        this.imgPathsSubject.next(imagePaths);

        // this.handbrakeDetails = obj as HandbrakeDetails;

        // const res = obj as HandbrakeSearchResult;
        // this.handbrakesSubject.next(res.handbrakes);
        // this.lengthSubject.next(res.count);

        // this.faultResultsSubject.next(res.fault_results);
        // this.faultCountSubject.next(res.fault_results[0]["value"]);
        // this.noFaultCountSubject.next(res.fault_results[1]["value"]);

        // this.typeResultsSubject.next(res.type_results);
        // this.typeCrmCountSubject.next(res.type_results[0]["value"]);
        // this.typeBlkCountSubject.next(res.type_results[1]["value"]);
        // this.typeUnknownCountSubject.next(res.type_results[2]["value"]);

        // this.countSeriesSubject.next(res.count_series);
      })


  }

}

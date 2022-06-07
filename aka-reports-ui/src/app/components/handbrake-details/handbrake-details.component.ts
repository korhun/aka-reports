import { Component, Inject, Input, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize } from "rxjs/operators";
import { CamDetails, HandbrakeDetails, HandbrakeHelper, HandbrakeItem } from 'src/app/models/handbrake-item.model';
import { HandbrakeService } from 'src/app/services/handbrake.service';
import { DomSanitizer } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-handbrake-details',
  templateUrl: './handbrake-details.component.html',
  styleUrls: ['./handbrake-details.component.scss']
})
export class HandbrakeDetailsComponent implements OnInit {

  constructor(private handbrakeService: HandbrakeService, private sanitizer: DomSanitizer, @Inject(DOCUMENT) private document: any) { }

  ngOnInit(): void {
  }

  handbrakeItem!: HandbrakeItem
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
    this.handbrakeItem = handbrakeItem

    this.loadingSubject.next(true);
    if (this.subs)
      this.subs.unsubscribe();

    this.handbrakeService.getHandbrakeDetails(handbrakeItem.key).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    )
      .subscribe(obj => {
        const details = obj as HandbrakeDetails
        const imagePaths: Array<any> = [];
        for (let key in details.cams) {
          const base64Txt: string = details.cams[key].preview;
          imagePaths.push(base64Txt);        }

        this.imgPathsSubject.next(imagePaths);
      })
  }


  openFullscreen(event:any) {
    var target = event.target || event.srcElement || event.currentTarget;

    if (target.requestFullscreen) {
      target.requestFullscreen();
    } else if (target.mozRequestFullScreen) {
      /* Firefox */
      target.mozRequestFullScreen();
    } else if (target.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      target.webkitRequestFullscreen();
    } else if (target.msRequestFullscreen) {
      /* IE/Edge */
      target.msRequestFullscreen();
    }
  }

  /* Close fullscreen */
  closeFullscreen() {
    if (this.document.exitFullscreen) {
      this.document.exitFullscreen();
    } else if (this.document.mozCancelFullScreen) {
      /* Firefox */
      this.document.mozCancelFullScreen();
    } else if (this.document.webkitExitFullscreen) {
      /* Chrome, Safari and Opera */
      this.document.webkitExitFullscreen();
    } else if (this.document.msExitFullscreen) {
      /* IE/Edge */
      this.document.msExitFullscreen();
    }
  }
}

import { Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { delay, filter, map, startWith } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { FormControl } from '@angular/forms';
import { AkaReporterService } from 'src/app/services/aka-reporter.service';
import { HandbrakeItem } from 'src/app/models/handbrake-item.model';
import { ThisReceiver } from '@angular/compiler';

import { AngularSplitModule } from 'angular-split';
@Component({
  selector: 'app-handbrake',
  templateUrl: './handbrake.component.html',
  styleUrls: ['./handbrake.component.scss']
})
export class HandbrakeComponent implements OnInit {
  search_barcode = '';
  // autocomplete_barcode: Observable<string[]>;

  barcodeSearchControl = new FormControl();
  autoCompleteList: Observable<string[]> = of([]);
  // handbrakeItems: HandbrakeItem[] = [];
  handbrakeItems: Observable<HandbrakeItem[]> = of([]);

  public get searchExists(): boolean {
    return this.barcodeSearchControl.value != null && this.barcodeSearchControl.value != ''
  }


  ngOnInit(): void {
    this.barcodeSearchControl.valueChanges.subscribe(value => this._updateAutoCompleteList(value));
    // this.filteredSearchResults = this.barcodeSearchControl.valueChanges.pipe(
    //   startWith(''),
    //   map(value => this._search(value)),
    // );
  }

  private sort(arr: HandbrakeItem[]) {
    if (arr)
      return arr.sort((a, b) => (new Date(b.time)).getTime() - (new Date(a.time)).getTime());
    else
      return arr;
  }
  private _updateAutoCompleteList(value: string): void {
    this.akaReporterService.searchBarcodes(value).subscribe({
      next: (response) => {
        this.autoCompleteList = of(response);
      },
      error: (err) => {
        console.log('HandbrakeComponent._updateAutoCompleteList error: ' + err.message);
      }
    });
  }
  public search(value: string): void {
    this.akaReporterService.searchHandbrakes(value).subscribe({
      next: (response) => {
        this.handbrakeItems = of(this.sort(response));
      },
      error: (err) => {
        console.log('HandbrakeComponent._search error: ' + err.message);
      }
    });
    // return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  public applySearch() {
    this.search(this.barcodeSearchControl.value)
  }

  public clearSearch() {
    this.barcodeSearchControl.setValue("")
    this.applySearch()
  }


  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;

  constructor(
    private observer: BreakpointObserver,
    private router: Router,
    private akaReporterService: AkaReporterService) {
  }

  // ngAfterViewInit() {
  //   this.observer
  //     .observe(['(max-width: 800px)'])
  //     // .pipe(delay(1), untilDestroyed(this))
  //     .subscribe((res) => {
  //       if (res.matches) {
  //         this.sidenav.mode = 'over';
  //         this.sidenav.close();
  //       } else {
  //         this.sidenav.mode = 'side';
  //         this.sidenav.open();
  //       }
  //     });

  //   this.router.events
  //     // .pipe(
  //     //   untilDestroyed(this),
  //     //   filter((e) => e instanceof NavigationEnd)
  //     // )
  //     .subscribe(() => {
  //       if (this.sidenav.mode === 'over') {
  //         this.sidenav.close();
  //       }
  //     });
  // }
}

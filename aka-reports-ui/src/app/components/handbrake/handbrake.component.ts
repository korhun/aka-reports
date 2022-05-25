import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { merge, fromEvent, Observable, of } from 'rxjs';
import { filter, map, debounceTime, distinctUntilChanged, startWith, tap, delay } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { AkaReporterService } from 'src/app/services/aka-reporter.service';
import { HandbrakeItem } from 'src/app/models/handbrake-item.model';
import { ThisReceiver } from '@angular/compiler';

import { AngularSplitModule } from 'angular-split';
import { MatTableDataSource } from '@angular/material/table';
import { HandbrakeDataSource } from 'src/app/services/handbrake.datasource';
import { HandbrakeService } from 'src/app/services/handbrake.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';


@Component({
  selector: 'app-handbrake',
  templateUrl: './handbrake.component.html',
  styleUrls: ['./handbrake.component.scss']
})
export class HandbrakeComponent implements OnInit, AfterViewInit {
  // ref: https://blog.angular-university.io/angular-material-data-table/
  // ref: https://github.com/angular-university/angular-material-course/tree/2-data-table-finished
  // displayedColumns = ["type", "hasFault", "date", "barcode"];
  displayedColumns = ["hasFault", "date", "barcode"];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('input') input!: ElementRef;

  length = 0;
  pageSize = 10;
  pageSizeOptions: number[] = [10, 50, 1000];


  // constructor(private observer: BreakpointObserver, private router: Router, private akaReporterService: AkaReporterService) {
  constructor(private handbrakeService: HandbrakeService, private cdr: ChangeDetectorRef) {
    // this.dataSource = new MatTableDataSource(this.handbrakeItems);
  }

  ngOnInit(): void {
    this.dataSource = new HandbrakeDataSource(this.handbrakeService);
    // this.dataSource.loadHandbrakes('', 'asc', 0, 3);


    this.barcodeSearchControl.valueChanges.subscribe(value => this._updateAutoCompleteList(value));
    // this.filteredSearchResults = this.barcodeSearchControl.valueChanges.pipe(
    //   startWith(''),
    //   map(value => this._search(value)),
    // );
  }


  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        debounceTime(150),
        distinctUntilChanged(),
        tap(() => {
          this.paginator.pageIndex = 0;
          this.loadHandbrakesPage();
        })
      )
      .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadHandbrakesPage())
      )
      .subscribe();

    this.loadHandbrakesPage()
    this.cdr.detectChanges();
  }

  loadHandbrakesPage() {
    this.dataSource.loadHandbrakes(this.barcodeSearchControl.value, this.sort.direction, this.paginator.pageIndex, this.paginator.pageSize);
  }






  search_barcode = '';

  barcodeSearchControl = new FormControl();
  autoCompleteList: Observable<string[]> = of([]);
  handbrakeItems: Observable<HandbrakeItem[]> = of([]);

  dataSource!: HandbrakeDataSource;

  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;

  public get searchExists(): boolean {
    return this.barcodeSearchControl.value != null && this.barcodeSearchControl.value != ''
  }


  private _updateAutoCompleteList(value: string): void {
    this.loadHandbrakesPage()
    // this.akaReporterService.searchBarcodes(value).subscribe({
    //   next: (response) => {
    //     this.autoCompleteList = of(response);
    //   },
    //   error: (err) => {
    //     console.log('HandbrakeComponent._updateAutoCompleteList error: ' + err.message);
    //   }
    // });
  }
  public search(value: string): void {
    this.loadHandbrakesPage()
    // this.akaReporterService.searchHandbrakes(value).subscribe({
    //   next: (response) => {
    //     this.handbrakeItems = of(this.sort(response));
    //   },
    //   error: (err) => {
    //     console.log('HandbrakeComponent._search error: ' + err.message);
    //   }
    // });
    // return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  public applySearch() {
    this.search(this.barcodeSearchControl.value)
  }

  public clearSearch() {
    this.barcodeSearchControl.setValue("")
    this.applySearch()
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










// ***** sil
  // private sort(arr: HandbrakeItem[]) {
  //   if (arr)
  //     return arr.sort((a, b) => (new Date(b.time)).getTime() - (new Date(a.time)).getTime());
  //   else
  //     return arr;
  // }

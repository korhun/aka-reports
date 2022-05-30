import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { merge, fromEvent, Observable, of, BehaviorSubject } from 'rxjs';
import { filter, map, debounceTime, distinctUntilChanged, startWith, tap, delay, switchMap } from 'rxjs/operators';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { HandbrakeHelper, HandbrakeItem, HandbrakeSearchOptions } from 'src/app/models/handbrake-item.model';
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

  dataSource!: HandbrakeDataSource;

  displayedColumns = ["hasFault", "date", "barcode"];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('input') input!: ElementRef;

  // length = 0;
  pageSize = 20;
  pageSizeOptions: number[] = [20, 50, 1000];

  optionsForm: FormGroup;

  public get barcodeFilterExists(): boolean {
    const opts: HandbrakeSearchOptions = this.optionsForm.value;
    if (opts.barcode_filter)
      return true;
    else
      return false;
  }
  public get noFilterExists(): boolean {
    const opts: HandbrakeSearchOptions = this.optionsForm.value;
    return !HandbrakeHelper.filterExists(opts)
  }
  constructor(fb: FormBuilder, private handbrakeService: HandbrakeService, private cdr: ChangeDetectorRef) {
    this.optionsForm = fb.group(HandbrakeHelper.createDefaultOptions());
  }

  ngOnInit(): void {
    this.dataSource = new HandbrakeDataSource(this.handbrakeService);
    // this.optionsForm.valueChanges.subscribe(value => this.loadHandbrakesPage());
    this.optionsForm.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      // switchMap(val=>val),
      tap(() => this.loadHandbrakesPage(true))
    ).subscribe();
  }


  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    // fromEvent(this.input.nativeElement, 'keyup')
    //   .pipe(
    //     debounceTime(150),
    //     distinctUntilChanged(),
    //     tap(() => {
    //       this.paginator.pageIndex = 0;
    //       this.loadHandbrakesPage();
    //     })
    //   )
    //   .subscribe();

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        debounceTime(150),
        tap(() => this.loadHandbrakesPage(false))
      )
      .subscribe();

    this.loadHandbrakesPage(true)
    this.cdr.detectChanges();
  }

  loadHandbrakesPage(firstPage:boolean) {
    this.cdr.detectChanges();
    if (firstPage) {
      this.paginator.pageIndex = 0
    }
    const opts: HandbrakeSearchOptions = this.optionsForm.value
    opts.sort_asc = this.sort.direction == "asc";
    opts.page_index = this.paginator.pageIndex;
    opts.page_size = this.paginator.pageSize;
    this.dataSource.loadHandbrakes(opts);
  }

  barcodeFilterControl = new FormControl();
  public clearBarcodeFilter() {
    this.barcodeFilterControl.setValue("")
    this.paginator.pageIndex = 0

    const opts: HandbrakeSearchOptions = this.optionsForm.value
    opts.barcode_filter = ""
    this.optionsForm.setValue(opts)
  }
  public clearAllFilter() {
    this.barcodeFilterControl.setValue("")
    this.paginator.pageIndex = 0
    const opts = HandbrakeHelper.createDefaultOptions()
    this.optionsForm.setValue(opts)
  }

  checkChanged_includeFault() {
    const opts: HandbrakeSearchOptions = this.optionsForm.value
    if (!opts.include_fault && !opts.include_no_fault) {
      this.optionsForm.patchValue({ include_no_fault: true });
    }
  }
  checkChanged_includeNoFault() {
    const opts: HandbrakeSearchOptions = this.optionsForm.value
    if (!opts.include_fault && !opts.include_no_fault) {
      this.optionsForm.patchValue({ include_fault: true });
    }
  }
  checkChanged_typeCrm() {
    const opts: HandbrakeSearchOptions = this.optionsForm.value
    if (!opts.type_crm && !opts.type_blk) {
      this.optionsForm.patchValue({ type_blk: true });
    }
  }
  checkChanged_typeBlk() {
    const opts: HandbrakeSearchOptions = this.optionsForm.value
    if (!opts.type_crm && !opts.type_blk) {
      this.optionsForm.patchValue({ type_crm: true });
    }
  }


  // barcodeSearchControl = new FormControl();
  // autoCompleteList: Observable<string[]> = of([]);
  // handbrakeItems: Observable<HandbrakeItem[]> = of([]);



  // @ViewChild(MatSidenav)
  // sidenav!: MatSidenav;

  // public get searchExists(): boolean {
  //   return this.barcodeSearchControl.value != null && this.barcodeSearchControl.value != ''
  // }

  // private _updateAutoCompleteList(value: string): void {
  //   this.loadHandbrakesPage()
  //   // this.akaReporterService.searchBarcodes(value).subscribe({
  //   //   next: (response) => {
  //   //     this.autoCompleteList = of(response);
  //   //   },
  //   //   error: (err) => {
  //   //     console.log('HandbrakeComponent._updateAutoCompleteList error: ' + err.message);
  //   //   }
  //   // });
  // }
  // public search(value: string): void {
  //   this.loadHandbrakesPage()
  //   // this.akaReporterService.searchHandbrakes(value).subscribe({
  //   //   next: (response) => {
  //   //     this.handbrakeItems = of(this.sort(response));
  //   //   },
  //   //   error: (err) => {
  //   //     console.log('HandbrakeComponent._search error: ' + err.message);
  //   //   }
  //   // });
  //   // return this.options.filter(option => option.toLowerCase().includes(filterValue));
  // }

  // public applySearch() {
  //   this.search(this.barcodeSearchControl.value)
  // }

  // public clearSearch() {
  //   this.barcodeSearchControl.setValue("")
  //   this.applySearch()
  // }


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

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
import { LegendPosition } from '@swimlane/ngx-charts';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { HandbrakeDetailsComponent } from '../handbrake-details/handbrake-details.component';

@Component({
  selector: 'app-handbrake',
  templateUrl: './handbrake.component.html',
  styleUrls: ['./handbrake.component.scss']
})
export class HandbrakeComponent implements OnInit, AfterViewInit {
  // ref: https://blog.angular-university.io/angular-material-data-table/
  // ref: https://github.com/angular-university/angular-material-course/tree/2-data-table-finished
  // ref: https://swimlane.gitbook.io/ngx-charts/examples/pie-charts/pie-chart

  pieLegendPosition: LegendPosition = LegendPosition.Below;
  graphLegendPosition: LegendPosition = LegendPosition.Right;

  faultColorScheme: any = {
    domain: ['#214185', '#e91e63']
  };
  typeColorScheme: any = {
    domain: ['#d3d3d3', '#36394b', '#e91e63']
  };
  countSeriesColorScheme: any = {
    domain: ['#214185', '#e91e63']
  };
  shiftSeriesColorScheme: any = {
    domain: ['#949b00', '#0b80df', '#018f24']
  };

  onSelect(data: any): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data: any): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data: any): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }

  dataSource!: HandbrakeDataSource;
  displayedColumns: Array<string> = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('input') input!: ElementRef;

  pageSize = 15;
  pageSizeOptions: number[] = [15, 50, 100, 1000];
  optionsForm: FormGroup;

  show_col_scan_date: boolean = true;
  show_col_fault_names: boolean = true;
  show_col_barcode_date: boolean = true;
  show_col_barcode: boolean = true;
  show_col_changed() {
    // ["has_fault", "scan_date", "fault_names", "barcode_date", "barcode"]
    this.displayedColumns = ["has_fault"];
    if (this.show_col_scan_date) this.displayedColumns.push("scan_date");
    if (this.show_col_fault_names) this.displayedColumns.push("fault_names");
    if (this.show_col_barcode_date) this.displayedColumns.push("barcode_date");
    if (this.show_col_barcode) this.displayedColumns.push("barcode");

    localStorage.setItem("show_col_scan_date", this.show_col_scan_date.toString())
    localStorage.setItem("show_col_fault_names", this.show_col_fault_names.toString())
    localStorage.setItem("show_col_barcode_date", this.show_col_barcode_date.toString())
    localStorage.setItem("show_col_barcode", this.show_col_barcode.toString())
  }

  init_columns() {
    this.show_col_scan_date = localStorage.getItem("show_col_scan_date") === "true";
    this.show_col_fault_names = localStorage.getItem("show_col_fault_names") === "true";
    this.show_col_barcode_date = localStorage.getItem("show_col_barcode_date") === "true";
    this.show_col_barcode = localStorage.getItem("show_col_barcode") === "true";
    this.show_col_changed()
  }

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
  constructor(fb: FormBuilder, private handbrakeService: HandbrakeService, private cdr: ChangeDetectorRef, private dialog: MatDialog) {
    this.init_columns();
    this.optionsForm = fb.group(HandbrakeHelper.createDefaultOptions());
  }

  ngOnInit(): void {
    this.dataSource = new HandbrakeDataSource(this.handbrakeService);
    this.optionsForm.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      tap(() => this.loadHandbrakesPage(true))
    ).subscribe();


    // this.dataSource.handbrakes$.subscribe((handbrakes) => {
    //   if (handbrakes && handbrakes.length>0)
    //     this.openDialog(handbrakes[0]);
    // })
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        debounceTime(150),
        tap(() => this.loadHandbrakesPage(false))
      )
      .subscribe();

    const pageSize = localStorage.getItem('paginator.pageSize')
    if (pageSize) {
      this.paginator.pageSize = Number(pageSize)
    }

    this.loadHandbrakesPage(true)
    this.cdr.detectChanges();
  }

  loadHandbrakesPage(firstPage: boolean) {
    this.cdr.detectChanges();
    if (firstPage) {
      this.paginator.pageIndex = 0
    }
    const opts: HandbrakeSearchOptions = this.optionsForm.value
    opts.sort_asc = this.sort.direction == "asc";
    opts.sort_active = this.sort.active;
    opts.page_index = this.paginator.pageIndex;
    opts.page_size = this.paginator.pageSize;
    localStorage.setItem('paginator.pageSize', this.paginator.pageSize.toString());
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

  onIconClicked(handbrake: HandbrakeItem) {
    this.openDialog(handbrake);
  }
  openDialog(handbrake: HandbrakeItem) {
    const dialogRef = this.dialog.open(HandbrakeDetailsComponent, {
      width: 'calc(100vw - 2em)',
      maxWidth: 'calc(100vw - 2em)',
      height: 'calc(100vh - 2em)',
      maxHeight: 'calc(100vh - 2em)',
    });
    let instance: HandbrakeDetailsComponent = dialogRef.componentInstance;
    instance.load(handbrake)

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }
}



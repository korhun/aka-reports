import { Component, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { delay, filter, map, startWith } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
// import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@Component({
  selector: 'app-handbrake',
  templateUrl: './handbrake.component.html',
  styleUrls: ['./handbrake.component.scss']
})
export class HandbrakeComponent implements OnInit {
  search_barcode = '';
  // autocomplete_barcode: Observable<string[]>;

  barcodeSearchControl = new FormControl();
  // options: string[] = ['aaa', 'ccc', 'Three'];
  filteredOptions!: Observable<string[]>;


  ngOnInit(): void {
    this.filteredOptions = this.barcodeSearchControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value)),
    );
  }

  private _filter(value: string): string[] {
    // const filterValue = value.toLowerCase();
    return ["aaa", "bbb"]

    // return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }


  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;

  constructor(private observer: BreakpointObserver, private router: Router) {}

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

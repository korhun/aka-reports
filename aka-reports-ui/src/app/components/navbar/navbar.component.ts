import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  @Output() isDarkThemeChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  private _isDarkTheme: boolean = false;
  @Input()
  get isDarkTheme(): boolean {
    return this._isDarkTheme;
  }
  set isDarkTheme(value: boolean) {
    if (this._isDarkTheme != value) {
      this._isDarkTheme = value
      this.isDarkThemeChange.emit(value);
    }
  }


  constructor() { }

  ngOnInit(): void {
  }

}

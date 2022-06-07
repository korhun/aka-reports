import { ChangeDetectorRef, Component, ElementRef, Output } from '@angular/core';
import { environment } from 'src/environments/environment';
import { OverlayContainer } from '@angular/cdk/overlay';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Orientis QAP';

  constructor(private elem: ElementRef, private cdr: ChangeDetectorRef, private _overlayContainer: OverlayContainer) {
    console.log("PROD: " + environment.production);
    this.init("title")
  }
  init(title: string): void {
    this.title = title;
  }


  private static readonly DARK_KEY: string = "algo_dark_theme";
  private _isDark: boolean = false;
  @Output()
  get isDarkTheme(): boolean {
    return this._isDark;
  }
  set isDarkTheme(value: boolean) {
    this.setDark(value, true);
  }
  private setDark(value: boolean, save: boolean) {
    this._isDark = value;
    if (save) {
      this.isDarkLocal = value;
    }

    // https://stackoverflow.com/a/48431919/1266873
    const theme = this._isDark ? "dark-theme" : "light-theme"
    const overlayContainerClasses = this._overlayContainer.getContainerElement().classList;
    const themeClassesToRemove = Array.from(overlayContainerClasses)
      .filter((item: string) => item.includes('-theme'));
    if (themeClassesToRemove.length) {
      overlayContainerClasses.remove(...themeClassesToRemove);
    }
    overlayContainerClasses.add(theme);

  }
  get isDarkLocal(): boolean {
    let val: any = localStorage.getItem(AppComponent.DARK_KEY);
    if (!val) {
      const browserIsDark: boolean = (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      val = browserIsDark ? "1" : "0";
    }
    return val == "1";
  }
  set isDarkLocal(value: boolean) {
    localStorage.setItem(AppComponent.DARK_KEY, value ? "1" : "0");
  }



  ngAfterViewInit() {
    this.setDark(this.isDarkLocal, false);
    this.cdr.detectChanges();
  }

}

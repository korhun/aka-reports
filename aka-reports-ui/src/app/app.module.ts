import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HandbrakeComponent } from './components/handbrake/handbrake.component';
import { HandbrakeItemComponent } from './components/handbrake-item/handbrake-item.component';
import { AngularSplitModule } from 'angular-split';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { getTurkishPaginatorIntl } from './utils/turkish-paginator-intl';

import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeTr from '@angular/common/locales/tr';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

registerLocaleData(localeTr);

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HandbrakeComponent,
    HandbrakeItemComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    AngularSplitModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    // { provide: LOCALE_ID, useValue: "en-US" },
    { provide: LOCALE_ID, useValue: "tr-TR" },
    { provide: MatPaginatorIntl, useValue: getTurkishPaginatorIntl() },
    MatDatepickerModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

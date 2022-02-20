import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LocationsComponent } from './components/locations/locations.component';
import { FilterComponent } from './components/filter/filter.component';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';

// routing
import { LocationRouteModule } from './location.routing.module';
import { HttpClientModule } from '@angular/common/http';
import { ListItemsComponent } from './components/list-items/list-items.component';
import { MapModule } from '../map/map.module';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { IConfig, NgxMaskModule } from 'ngx-mask';
import { ScreensHotModule } from '../screenshot/screenshot.module';

export const options: Partial<IConfig> | (() => Partial<IConfig>) = {};
@NgModule({
  declarations: [
    LocationsComponent,
    FilterComponent,
    ListItemsComponent,
  ],
  imports: [
    LocationRouteModule,
    ScreensHotModule,
    MapModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    CommonModule,
    MatSidenavModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatSidenavModule,
    MatInputModule,
    NgxSliderModule,
    HttpClientModule,
    MatProgressBarModule,
    NgxMaskModule.forRoot(options),
  ],
  exports: [
    LocationsComponent, FilterComponent, ListItemsComponent, NgxMaskModule,
  ],
  providers: [],
  bootstrap: [LocationsComponent],
})
export class LocationsModule { }

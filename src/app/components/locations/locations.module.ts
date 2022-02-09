import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { GoogleMapsModule } from '@angular/google-maps';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LocationsComponent } from './components/locations/locations.component';
import { FilterComponent } from './components/filter/filter.component';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';

// components


// modules


// routing
import { AppLocationModule } from './location.routing.module';

@NgModule({
  declarations: [
    FilterComponent,
    LocationsComponent
  ],
  imports: [
    AppLocationModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    CommonModule,
    MatSidenavModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [LocationsComponent]
})
export class LocationsModule { }

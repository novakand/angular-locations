import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { GoogleMapsModule } from '@angular/google-maps';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';

// components
import { AppComponent } from './components/app/app.component';
import { StaticticsComponent } from './components/statictics/components/statictics/statictics.component';
import { MapComponent } from './components/map/components/map/map.component';
import { LegendComponent } from './components/map/components/legend/legend.component';

// modules
import { AppRoutingsModule } from './app.routings.module';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    LegendComponent,
    StaticticsComponent
  ],
  imports: [
    BrowserModule,
    GoogleMapsModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    AppRoutingsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

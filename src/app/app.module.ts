import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { GoogleMapsModule } from '@angular/google-maps';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import {MatSliderModule} from '@angular/material/slider';

// components
import { AppComponent } from './components/app/app.component';
import { StaticticsComponent } from './components/statictics/components/statictics/statictics.component';
import { MapComponent } from './components/map/components/map/map.component';
import { LegendComponent } from './components/map/components/legend/legend.component';

// modules
import { AppRoutingsModule } from './app.routings.module';
import { LocationsComponent } from './components/locations/components/locations/locations.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import {MatInputModule} from '@angular/material/input';
import { AppLocationModule } from './components/locations/location.routing.module';
import { FilterComponent } from './components/locations/components/filter/filter.component';
import { ListItemsComponent } from './components/locations/components/list-items/list-items.component';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { MapInfoBoxComponent } from './components/map/components/map-info-box/map-info-box.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    MapInfoBoxComponent,
    LegendComponent,
    StaticticsComponent,
    LocationsComponent,
    FilterComponent,
    ListItemsComponent
  ],
  imports: [
    BrowserModule,
    GoogleMapsModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    AppRoutingsModule,
    AppLocationModule,
    MatSidenavModule,
    MatSliderModule,
    MatInputModule,
    NgxSliderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

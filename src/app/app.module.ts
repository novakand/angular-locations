import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { GoogleMapsModule } from '@angular/google-maps';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSliderModule } from '@angular/material/slider';

// components
import { AppComponent } from './components/app/app.component';
import { StaticticsComponent } from './components/statictics/components/statictics/statictics.component';
import { MapComponent } from './components/map/components/map/map.component';
import { LegendComponent } from './components/map/components/legend/legend.component';

// modules
import { AppRoutingsModule } from './app.routings.module';
import { LocationsComponent } from './components/locations/components/locations/locations.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatInputModule } from '@angular/material/input';
import { AppLocationModule } from './components/locations/location.routing.module';

import { ListItemsComponent } from './components/locations/components/list-items/list-items.component';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { MapInfoBoxComponent } from './components/map/components/map-info-box/map-info-box.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FilterComponent } from './components/locations/components/filter/filter.component';
import { HttpClientModule } from '@angular/common/http';
import { LocationsService } from './components/locations/services/locations.service';
import { HttpClientService } from './services/http-client.service';
import { SettingsService } from './services/settings.service';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    MapInfoBoxComponent,
    LegendComponent,
    StaticticsComponent,
    LocationsComponent,
    FilterComponent,
    ListItemsComponent,
  ],
  imports: [
    BrowserModule,
    DragDropModule,
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
    NgxSliderModule,
    HttpClientModule
  ],
  providers: [HttpClientService, LocationsService, SettingsService],
  bootstrap: [AppComponent]
})
export class AppModule { }

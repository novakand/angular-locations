import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

// components
import { AppComponent } from './components/app/app.component';

// modules
import { AppRoutingsModule } from './app.routings.module';

import { HttpClientModule } from '@angular/common/http';
import { LocationsService } from './components/locations/services/locations.service';
import { HttpClientService } from './services/http-client.service';
import { SettingsService } from './services/settings.service';
import { LocationsModule } from './components/locations/locations.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    AppRoutingsModule,
    LocationsModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingsModule,
    HttpClientModule,
    NgxMaskModule.forRoot(),
  ],
  providers: [HttpClientService, LocationsService, SettingsService],
  bootstrap: [AppComponent],
})
export class AppModule { }

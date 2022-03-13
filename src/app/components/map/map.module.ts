import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatRadioModule } from '@angular/material/radio';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// components
import { LegendComponent } from './components/legend/legend.component';
import { MapComponent } from './components/map/map.component';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { MatMenuModule } from '@angular/material/menu';
@NgModule({
    imports: [
        CommonModule,
        GoogleMapsModule,
        DragDropModule,
        CommonModule,
        ReactiveFormsModule,
        HttpClientModule,
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatRadioModule,
        MatSlideToggleModule,
        NgxSliderModule,
        MatMenuModule,
    ],
    declarations: [
        LegendComponent,
        MapComponent,
    ],
    exports: [
        LegendComponent,
        MapComponent,
    ],
})
export class MapModule { }

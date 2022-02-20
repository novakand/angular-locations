import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// components
import { LegendComponent } from './components/legend/legend.component';
import { MapComponent } from './components/map/map.component';

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

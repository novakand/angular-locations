import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';

// components
import { LegendComponent } from './components/legend/legend.component';
import { MapComponent } from './components/map/map.component';

@NgModule({
    imports: [
        CommonModule,
        GoogleMapsModule,
        DragDropModule,
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

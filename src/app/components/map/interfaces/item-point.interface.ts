import { MapMarker } from '@angular/google-maps';
import { IInfoWindow } from './info-windows.interface';
import { IMarkerOptions } from './marker-options.interface';

export interface IItemPoint extends IMarkerOptions {
    info: IInfoWindow;
    marker: MapMarker;
}

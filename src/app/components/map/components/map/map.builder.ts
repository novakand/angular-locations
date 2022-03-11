import { Injectable } from '@angular/core';

// components
import { MapComponent } from './map.component';

// enums
import { MarkerTypeIcon } from '../../enums/marker-icon-type.enum';
import { MarkerType } from '../../enums/marker-type.enum';

// interfaces
import { IMarkerOptions } from '../../interfaces/marker-options.interface';


@Injectable()
export class MapBuilder {

    public cmp: MapComponent;

    constructor() { }

    public updateMarker(type: MarkerType, item?): IMarkerOptions {
        const LatLng = type === MarkerType.office
            && this._convertOffset(new google.maps.LatLng(item.lat, item.lon), 50, 0);
        return this.cmp.markerOptions = {
            draggable: true,
            crossOnDrag: false,
            icon: {
                url: MarkerTypeIcon.virtual,
            },
            position: type === MarkerType.virtual
                ? { lat: item.lat, lng: item.lon } :
                { lat: LatLng.lat(), lng: LatLng.lng() },
            id: this.cmp.markerId,
            type: MarkerType.office,
        };
    }

    public createMarkerOptions(type: MarkerType, item?): IMarkerOptions {
        return this.cmp.markerOptions = {
            draggable: type === MarkerType.office,
            crossOnDrag: false,
            icon: type === MarkerType.virtual ? MarkerTypeIcon.office : MarkerTypeIcon.virtual,
            position: type === MarkerType.virtual
                ? { lat: item.lat, lng: item.lon } :
                this._convertOffset(new google.maps.LatLng(this.cmp.selectedOffice.lat, this.cmp.selectedOffice.lon), 50, 0),
            id: type === MarkerType.virtual ? null : this.cmp.markerId,
            type: type,
        };
    }


    private _convertOffset(latlng: google.maps.LatLng, offsetX: number, offsetY: number): google.maps.LatLng {

        const scale = Math.pow(2, this.cmp.map.googleMap.getZoom());
        const worldCoordinateCenter = this.cmp.map.googleMap.getProjection().fromLatLngToPoint(latlng);
        const pixelOffset = new google.maps.Point((offsetX / scale) || 0, (offsetY / scale) || 0);

        const worldCoordinateNewCenter = new google.maps.Point(
            worldCoordinateCenter.x - pixelOffset.x,
            worldCoordinateCenter.y + pixelOffset.y,
        );
        return this.cmp.map.googleMap.getProjection().fromPointToLatLng(worldCoordinateNewCenter);
    }

}

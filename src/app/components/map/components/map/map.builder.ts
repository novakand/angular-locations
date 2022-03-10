import { Injectable } from '@angular/core';
import { MarkerTypeIcon } from '../../enums/marker-icon-type.enums';
import { MarkerType } from '../../enums/marker-type.enum';
import { IMarkerOptions } from '../../interfaces/marker-options.interface';
import { MapComponent } from './map.component';

@Injectable()
export class MapBuilder {

    public cmp: MapComponent;

    constructor() { }


    public createMarkerOptions(type: MarkerType, item?): IMarkerOptions {
        const LatLng = type === MarkerType.virtual
            && this._convertOffset(new google.maps.LatLng(this.cmp.selectedOffice.lat, this.cmp.selectedOffice.lon), 50, 0);
        return this.cmp.markerOptions = {
            draggable: type === MarkerType.virtual,
            crossOnDrag: false,
            icon: {
                url: type === MarkerType.office ? MarkerTypeIcon.mainOffice : MarkerTypeIcon.virtualOffice,
            },
            position: type === MarkerType.office
                ? { lat: item.lat, lng: item.lon } :
                { lat: LatLng.lat(), lng: LatLng.lng() },
            id: type === MarkerType.office ? null : this.cmp.markerId,
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

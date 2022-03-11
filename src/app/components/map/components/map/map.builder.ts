import { Injectable } from '@angular/core';

// components
import { MapComponent } from './map.component';

// enums
import { MarkerTypeIcon } from '../../enums/marker-icon-type.enum';
import { MarkerType } from '../../enums/marker-type.enum';

// interfaces
import { IMarkerOptions } from '../../interfaces/marker-options.interface';
import { INearby } from '../../../../components/locations/interfaces/nearby.interface';
import { ICommutes } from '../../../../components/locations/interfaces/commutes.interface';
import { ColorsType } from '../../enums/color-type.enum';
import { IPolylineOptions } from '../../interfaces/polyline-options.interface';


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

    public createCircleOptions(item: INearby): google.maps.CircleOptions {
        return this.cmp.circleOptions = {
            center: new google.maps.LatLng(item.center.lat, item.center.lon),
            radius: item.radiusKm * 1000,
            fillColor: '#1471ea',
            fillOpacity: 0.2,
            strokeColor: '#1471ea',
            strokeOpacity: 0.2,
        };
    }


    public createPolylineOptions(item: ICommutes): IPolylineOptions {
        return this.cmp.polylineOptions = {
            strokeColor: ColorsType[item.commuteCO2Quartile],
            strokeWeight: 4,
            zIndex: 10,
            path: this._convertLatLng(item),
            data: item,
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

    private _convertLatLng(items: ICommutes): google.maps.LatLng[] {
        const latLngs: google.maps.LatLng[] = [];
        items.commute.forEach((latlng: any) => {
            const latLng = new google.maps.LatLng(latlng[0], latlng[1]);
            latLngs.push(latLng);
            this.cmp.bounds.extend(latLng);
        });
        return latLngs;
    }

}

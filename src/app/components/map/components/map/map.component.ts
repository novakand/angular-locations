import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow } from '@angular/google-maps';

// interfaces
import { FilterResponce } from '../../../locations/interfaces/filter-responce.interfaces';
import { MarkerTypeIcon } from '../../enums/marker-icon-type.enums';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  providers: [GoogleMap],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnInit, OnChanges {

  constructor(
    private cdr: ChangeDetectorRef,
  ) { }

  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;

  @Input() public dataFilterLocation: FilterResponce;
  @Input() public addPoint: void;

  public markers: google.maps.MarkerOptions[] = [];
  public circles: google.maps.CircleOptions[] = [];
  public polylines: google.maps.PolygonOptions[] = [];
  public infoWindowBox: google.maps.InfoWindow[] = [];
  public infoWindowViewContent: string;
  public selectedPolyline: any;

  public sliderOptions: any = {
    floor: 0,
    value: 80,
    ceil: 100,
    minRange: 0,
    maxRange: 100,
  };


  public infoWindowOptions: google.maps.InfoWindowOptions = {
    disableAutoPan: false,
  };

  public mapOptions: google.maps.MapOptions = {
    center: { lat: 37.772, lng: -122.214 },
    restriction: { strictBounds: false, latLngBounds: { north: 83.8, south: -83.8, west: -180, east: 180 } },
    zoom: 8,
    disableDefaultUI: true,
    minZoom: 3,
    disableDoubleClickZoom: false,
    clickableIcons: false,
  };

  public circleOptions: google.maps.CircleOptions = {};
  public markerOptions: google.maps.MarkerOptions = {};
  public polylineOptions: google.maps.PolylineOptions = {};
  public bounds: google.maps.LatLngBounds = new google.maps.LatLngBounds();

  public ngOnInit(): void { }


  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.dataFilterLocation && changes.dataFilterLocation.currentValue) {
      this.buildPolylines();
      this.buildMarker(this.dataFilterLocation.forecastPoint);
      this.buildCircle(this.dataFilterLocation);
    }

    if (changes.addPoint && changes.addPoint.currentValue) {

      if (this.dataFilterLocation) {
        this.markerOptions = {
          draggable: true,
          crossOnDrag: false,
          icon: { url: MarkerTypeIcon.virtualOffice, anchor: new google.maps.Point(80, 75) },
          anchorPoint: new google.maps.Point(-290, 90),
          position: { lat: this.dataFilterLocation.forecastPoint.lat, lng: this.dataFilterLocation.forecastPoint.lon },
        };

        this.markers.push(this.markerOptions);
        // tslint:disable-next-line: max-line-length
        // this.map.googleMap.setCenter(new google.maps.LatLng(this.dataFilterLocation.forecastPoint.lat, this.dataFilterLocation.forecastPoint.lon));
      }
    }
  }

  public buildMarker(point: any): void {
    this.infoWindowViewContent = 'marker';
    const marker = this.createMarkerOptions(point);
    this.markers.push(marker);
    this.infoWindow.position = marker.position;
    this.infoWindow.open();
    this.cdr.detectChanges();
  }


  public createMarkerOptions(point: any): google.maps.MarkerOptions {
    return this.markerOptions = {
      draggable: false,
      icon: MarkerTypeIcon.mainOffice,
      position: { lat: point.lat, lng: point.lon },
    };
  }

  public buildCircle(obj: any): void {
    this.circles.push(this.createCircleOptions(obj));
    this.cdr.detectChanges();
  }

  public createCircleOptions(obj: any): google.maps.CircleOptions {
    return this.circleOptions = {
      strokeColor: '#1471ea',
      strokeOpacity: 0.3,
      fillColor: '#1471ea',
      fillOpacity: 0.3,
      radius: (obj.nearbies[0].radiusKm * 1000),
      center: { lat: obj.nearbies[0].centerLat, lng: obj.nearbies[0].centerLon }
    };
  }

  private buildPolylines(): void {
    this.dataFilterLocation.commutes.forEach((item) => {
      this.polylines.push(this.createPolylineOptions(item));
    });
    this.fitBounds();
    this.cdr.detectChanges();
  }

  public markerClick(marker): void {
    this.infoWindowViewContent = 'marker';
    this.infoWindow.position = marker.getPosition();
    this.infoWindow.open();
    this.infoWindow.infoWindow.setOptions({ pixelOffset: new google.maps.Size(0, -60) });
  }

  public onApplyInfoWindows(): void {
    this.infoWindow.close();
    this.selectedPolyline.setOptions({ icons: [] });
    this.selectedPolyline = null;
  }

  public polylineDblclick(polyline): void {

    const selected = {
      path: 'M 0,-1 0,1',
      strokeOpacity: 0.4,
      strokeColor: 'blue',
      strokeWeight: 10,
      scale: 4,
    };

    // tslint:disable-next-line: no-unused-expression
    this.selectedPolyline && this.selectedPolyline.setOptions({ icons: [] });
    polyline.polyline.setOptions({ icons: [{ icon: selected, offset: '0', repeat: '2px', }] });
    this.selectedPolyline = polyline.polyline;

    this.cdr.detectChanges();
    this.infoWindowViewContent = 'polyline';
    const bounds = new google.maps.LatLngBounds();
    polyline.getPath().getArray().forEach((latLng) => {
      bounds.extend(latLng);
    });

    const center = bounds.getCenter();
    this.map.googleMap.setCenter(center);
    this.infoWindow.position = center;
    this.infoWindow.infoWindow.setOptions({ pixelOffset: new google.maps.Size(0, 280) });
    this.infoWindow.open();
    this.cdr.detectChanges();
  }

  private createPolylineOptions(hotel: any): google.maps.PolygonOptions {
    return this.polylineOptions = {
      strokeColor: hotel.commuteCO2Quartile,
      strokeWeight: 4,
      zIndex: 10,
      path: this.convertLatLng(hotel),
    };
  }

  public convertLatLng(items): google.maps.LatLng[] {
    const latLngs = [];
    items.commute.forEach((latlng) => {
      const latLng = new google.maps.LatLng(latlng[0], latlng[1]);
      latLngs.push(latLng);
      this.bounds.extend(latLng);
    });

    return latLngs;
  }

  public fitBounds(): void {
    this.map.fitBounds(this.bounds);
  }
}


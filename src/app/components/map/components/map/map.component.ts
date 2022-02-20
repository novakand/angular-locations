import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow } from '@angular/google-maps';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { LocationsService } from 'src/app/components/locations/services/locations.service';

// enums
import { MarkerTypeIcon } from '../../enums/marker-icon-type.enums';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  providers: [GoogleMap],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnInit {

  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;

  public dataFilterLocation: any;
  public destroy$ = new Subject<boolean>();

  public restangle: google.maps.RectangleOptions;
  public markers: google.maps.MarkerOptions[] = [];
  public circles: google.maps.CircleOptions[] = [];
  public polylines: google.maps.PolygonOptions[] = [];
  public infoWindowBox: google.maps.InfoWindow[] = [];
  public infoWindowViewContent: string;
  public selectedPolyline: any;

  public sliderOptions: any = {
    floor: 0,
    value: 80,
    ceil: 80,
    minRange: 0,
    maxRange: 16,
    hideLimitLabels: true,
    hidePointerLabels: true,
    showSelectionBar: true,
    step: 1,
  };

  public infoWindowOptions: google.maps.InfoWindowOptions = {
    disableAutoPan: false,
  };

  public mapOptions: google.maps.MapOptions = {
    center: { lat: 48.79875, lng: 2.538979 },
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
  public bounds: google.maps.LatLngBounds;

  constructor(
    private cdr: ChangeDetectorRef,
    private serv: LocationsService,
  ) { }

  public ngOnInit(): void {

    this.bounds = new google.maps.LatLngBounds();
    this.serv.takeFilter$
      .pipe(
        filter(Boolean),
        takeUntil(this.destroy$),
      ).
      subscribe((data: any) => {

        this.markers = [];
        this.circles = [];
        this.polylines = [];
        this.cdr.detectChanges();
        this.dataFilterLocation = [];
        this.dataFilterLocation = data;
        this.infoWindowOptions = {};
        // this.infoWindowOptions.pixelOffset = new google.maps.Size(0, -60);
        // this.infoWindowOptions.disableAutoPan = false;
       // this.buildMarker(this.dataFilterLocation.forecastPoint);
        // this.buildCircle(this.dataFilterLocation);
        this.buildPolylines();
      });

    this.serv.actionAddPoint$.pipe(
      takeUntil(this.destroy$),
    ).
      subscribe((data: any) => {
        this.addOffice();
      });

  }

  public addOffice(): void {
    this.markerOptions = {
      draggable: true,
      crossOnDrag: false,
      icon: { url: MarkerTypeIcon.virtualOffice, anchor: new google.maps.Point(80, 75) },
      anchorPoint: new google.maps.Point(-290, 90),
    //position: { lat: this.dataFilterLocation.forecastPoint.lat, lng: this.dataFilterLocation.forecastPoint.lon },
    };

    this.markers.push(this.markerOptions);
    // tslint:disable-next-line: max-line-length
    // this.map.googleMap.setCenter(new google.maps.LatLng(this.dataFilterLocation.forecastPoint.lat, this.dataFilterLocation.forecastPoint.lon));
  }

  // tslint:disable-next-line: use-lifecycle-interface
  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
    this.markers = [];
    this.circles = [];
    this.polylines = [];
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

  public buildRestangle(): void {
    this.restangle = this.createRestangleOptions();
    this.cdr.detectChanges();
  }

  public createRestangleOptions(): google.maps.RectangleOptions {
    const p1 = this.dataFilterLocation.nearbies[0].rectPoint1;
    const p2 = this.dataFilterLocation.nearbies[0].rectPoint2;

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(new google.maps.LatLng(p1.lat, p1.lon));
    bounds.extend(new google.maps.LatLng(p2.lat, p2.lon));
    this.map.fitBounds(bounds);

    return this.restangle = {
      strokeColor: '#1471ea',
      strokeOpacity: 0.3,
      fillColor: '#1471ea',
      fillOpacity: 0.8,
      bounds

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
      strokeWeight: 12,
      scale: 4,
    };

    // tslint:disable-next-line: no-unused-expression
    this.selectedPolyline && this.selectedPolyline.setOptions({ icons: [] });
    polyline.polyline.setOptions({ icons: [{ icon: selected, offset: '0', repeat: '2px', }] });
    this.selectedPolyline = polyline.polyline;

    this.cdr.detectChanges();
    // this.infoWindowViewContent = 'polyline';
    const bounds = new google.maps.LatLngBounds();
    polyline.getPath().getArray().forEach((latLng) => {
      bounds.extend(latLng);
    });

    const center = bounds.getCenter();
    this.map.googleMap.setCenter(center);
    this.infoWindow.position = center;
    // this.infoWindow.infoWindow.setOptions({ pixelOffset: new google.maps.Size(0, 280) });
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


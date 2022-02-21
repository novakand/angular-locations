import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow } from '@angular/google-maps';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { FilterResponce } from '../../../../components/locations/interfaces/filter-responce.interfaces';
import { LocationsService } from '../../../../components/locations/services/locations.service';

// enums
import { MarkerTypeIcon } from '../../enums/marker-icon-type.enums';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  providers: [GoogleMap],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnInit, OnDestroy {

  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow;

  public destroy$ = new Subject<boolean>();

  public restangle: google.maps.RectangleOptions;
  public markers: google.maps.MarkerOptions[] = [];
  public circles: google.maps.CircleOptions[] = [];
  public polylines: google.maps.PolygonOptions[] = [];
  public infoWindowBox: google.maps.InfoWindow[] = [];
  public infoWindowViewContent: string;
  public selectedPolyline: any;
  public center: any;

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
  public dataSource: FilterResponce;

  constructor(
    private cdr: ChangeDetectorRef,
    private _locService: LocationsService,
  ) { }

  public ngOnInit(): void {

    this.bounds = new google.maps.LatLngBounds();
    this._locService.takeFilter$
      .pipe(
        filter(Boolean),
        takeUntil(this.destroy$),
      ).
      subscribe((data: FilterResponce) => {
        this.dataSource = data;
        this.removeMapObject();
        this.buildMarker();
        this.dataSource.nearbies && this.buildCircle();
        this.dataSource.commutes && this.buildPolylines();
        this.createInfoWindow();
      });

    this._locService.actionAddPoint$.pipe(
      filter(Boolean),
      takeUntil(this.destroy$),
    ).
      subscribe((data: any) => {
        this.addOffice();
      });

  }

  public createInfoWindow() {
    this.infoWindowOptions = {};
    this.infoWindowOptions.pixelOffset = new google.maps.Size(0, -60);
    this.infoWindowOptions.disableAutoPan = false;
  }

  public removeMapObject(): void {
    this.markers = [];
    this.circles = [];
    this.polylines = [];
    this.cdr.detectChanges();
  }

  public addOffice(): void {
    this.markerOptions = {
      draggable: true,
      crossOnDrag: false,
      icon: { url: MarkerTypeIcon.virtualOffice, anchor: new google.maps.Point(80, 75) },
      anchorPoint: new google.maps.Point(-290, 90),
      position: { lat: this.dataSource.forecastPoint.lat, lng: this.dataSource.forecastPoint.lon },
    };

    this.markers.push(this.markerOptions);
    this.map.googleMap.setCenter(new google.maps.LatLng(this.dataSource.forecastPoint.lat, this.dataSource.forecastPoint.lon));
    this.cdr.detectChanges();
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
    this.markers = [];
    this.circles = [];
    this.polylines = [];
  }

  public buildMarker(): void {
    this.infoWindowViewContent = 'marker';
    const point = this.dataSource.forecastPoint;
    const marker = this.createMarkerOptions(point);
    this.markers.push(marker);
    this.center = marker.position;
    this.map.googleMap.setCenter(marker.position);
    // this.infoWindow = new google.maps.InfoWindow();
    // this.infoWindow.position = marker.position;
    // this.infoWindow.open();
    this.cdr.detectChanges();
  }

  public buildCircle(): void {
    this.dataSource.nearbies.forEach((item) => {
      this.addCircle(item);
    });
  }

  public addCircle(item): void {
    this.circles.push(this.createCircleOptions(item));
  }

  public createCircleOptions(item): google.maps.CircleOptions {
    return this.circleOptions = {
      center: new google.maps.LatLng(item.center.lat, item.center.lon),
      radius: item.radiusKm * 1000,
      fillColor: '#1471ea',
      fillOpacity: 0.2,
      strokeColor: '#1471ea',
      strokeOpacity: 0.2,
    };
  }


  public createMarkerOptions(point: any): google.maps.MarkerOptions {
    return this.markerOptions = {
      draggable: false,
      icon: MarkerTypeIcon.mainOffice,
      position: { lat: point.lat, lng: point.lon },
    };
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
    !!this.dataSource.commutes.length && this.map.fitBounds(this.bounds);
  }

  private createPolylineOptions(item: any): google.maps.PolygonOptions {
    return this.polylineOptions = {
      strokeColor: item.commuteCO2Quartile,
      strokeWeight: 4,
      zIndex: 10,
      path: this.convertLatLng(item),
    };
  }

  private buildPolylines(): void {
    this.dataSource.commutes.forEach((item) => {
      this.polylines.push(this.createPolylineOptions(item));
    });
    this.fitBounds();
    this.cdr.detectChanges();
  }


}


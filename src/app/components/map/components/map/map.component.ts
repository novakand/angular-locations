import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { ForecastPoint } from 'src/app/components/locations/models/forecat-point';
import { FilterResponce } from '../../../../components/locations/interfaces/filter-responce.interfaces';
import { LocationsService } from '../../../../components/locations/services/locations.service';
import { MatMenuTrigger } from '@angular/material/menu';

// enums
import { MarkerTypeIcon } from '../../enums/marker-icon-type.enums';
import { MarkerType } from '../../enums/marker-type';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  providers: [GoogleMap],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnInit, OnDestroy {

  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false }) infoWindow: MapInfoWindow;
  @ViewChild(MatMenuTrigger) public contextMenu: MatMenuTrigger;

  public isAddMarker = true;
  public destroy$ = new Subject<boolean>();
  public markerId = 0;
  public restangle: google.maps.RectangleOptions;
  public markers: MarkerOptions[] = [];
  public forcastMarker: MarkerOptions[] = [];
  public circles: google.maps.CircleOptions[] = [];
  public polylines: google.maps.PolygonOptions[] = [];
  public infoWindowBox: google.maps.InfoWindow[] = [];
  public selectedPolyline: any;
  public selectedInfoWindow: any;
  public visible: boolean;
  public center: any;
  public isChekedForecast$ = this._locService.isChekedForecast$;
  public isBuildMarker = true;
  public contextMenuPosition = { x: '0px', y: '0px' };
  public forecastPoints: any[] = [];
  public selectedOffice: any;

  public sliderOptions: any = {
    floor: 0,
    value: 5,
    ceil: 5,
    minRange: 0,
    maxRange: 5,
    hideLimitLabels: true,
    hidePointerLabels: true,
    showSelectionBar: true,
    step: 1,
  };

  public infoWindowOptions: google.maps.InfoWindowOptions = {
    disableAutoPan: false,
  };

  public mapOptions: google.maps.MapOptions = {
    center: { lat: 51.5115238, lng: -0.0870248 },
    restriction: { strictBounds: false, latLngBounds: { north: 83.8, south: -83.8, west: -180, east: 180 } },
    zoom: 8,
    disableDefaultUI: true,
    minZoom: 3,
    disableDoubleClickZoom: false,
    clickableIcons: false,
  };

  public circleOptions: google.maps.CircleOptions = {};
  public markerOptions: MarkerOptions = {};
  public polylineOptions: PolylineOptions = {};
  public bounds: google.maps.LatLngBounds;
  public dataSource: any;

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
      subscribe((source: any) => {
        this.dataSource = source.data;
        this.cdr.detectChanges();
        this.removeMapObject();
        (this.dataSource.allOffices && this.isAddMarker) && this.buildMarker();
        this.dataSource.nearbies && this.buildCircle();
        this.dataSource.commutes && this.buildPolylines();
        this.createInfoWindow();

        this.dataSource?.forecastPoints && this.buildForecastPoint();

        this.selectedOffice = this.dataSource.allOffices.find((item) => item.isSelected);
        this.isAddMarker = false;
      });

    this._locService.actionAddPoint$.pipe(
      filter(Boolean),
      takeUntil(this.destroy$),
    ).
      subscribe((data: any) => {
        this.addOffice();
      });

    this._locService.isChekedForecast$
      .pipe(
        filter(Boolean),
        takeUntil(this.destroy$),
      ).
      subscribe((data: any) => {
        this.isBuildMarker = data;
      });
  }

  public buildForecastPoint(): void {
    this.dataSource?.forecastPoints && this.dataSource?.forecastPoints.forEach((value, index) => {
      this.forcastMarker[index].data = value;
    });
  }

  public onShowStats(item): void {
    item.info.position = item.position;
    item.info.open();
    item.info.infoWindow.setOptions({ pixelOffset: new google.maps.Size(0, -60) });
  }

  public onRemove(item, index): void {
    this.forcastMarker = this.forcastMarker.filter((v) => v.id !== item.id);
    this._locService.mapDrag$.next(this.buildForcast());
    this.cdr.detectChanges();
  }

  public onMapRightclick(event, m, info, i): void {
    const inf = { ...m, info };
    this.contextMenuPosition.x = `${event.domEvent.clientX}px`;
    this.contextMenuPosition.y = `${event.domEvent.clientY}px`;
    this.contextMenu.menuData = { item: inf };
    this.contextMenu.openMenu();
  }

  public draggableChanged(marker: any, m): void {
    const mm = this.forcastMarker?.find((mark) => mark.id === m.id);
    mm.position.lat = marker.getPosition().lat();
    mm.position.lng = marker.getPosition().lng();
    this._locService.mapDrag$.next(this.buildForcast());
  }

  public buildForcast(): any[] {
    const forMarker = [];
    this.forcastMarker && this.forcastMarker.forEach((value) => {
      forMarker.push({ lat: value.position.lat, lon: value.position.lng, });
    });
    return forMarker;
  }

  public visibleChanged() { }

  public createInfoWindow() {
    this.infoWindowOptions = {};
    this.infoWindowOptions.pixelOffset = new google.maps.Size(0, -60);
    this.infoWindowOptions.disableAutoPan = false;
  }

  public removeMapObject(): void {
    this.circles = [];
    this.polylines = [];
    this.cdr.detectChanges();
  }

  public addOffice(): void {
    this.markerId++;
    const marker = this.createMarkerOptions(MarkerType.virtual, true);
    this.forcastMarker.push(marker);
    this._locService.addForecastPoint$.next(this.dataSource?.forecastPoints);
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
    this.dataSource.allOffices.forEach((item) => {
      const marker = this.createMarkerOptions(MarkerType.main, false, item);
      this.bounds.extend(marker.position);
      this.markers.push(marker);
    });

    this.dataSource.forecastPoints.forEach((item) => {
      const marker = this.createMarkerOptions(MarkerType.virtual, true, item);
      this.bounds.extend(marker.position);
      this.forcastMarker.push(marker);
    });

    this.cdr.detectChanges();
  }

  public createMarkerOptions(type: MarkerType, anchor, item?): MarkerOptions {
    return this.markerOptions = {
      draggable: type === MarkerType.virtual,
      crossOnDrag: false,
      icon: {
        url: type === MarkerType.main ? MarkerTypeIcon.mainOffice : MarkerTypeIcon.virtualOffice
        , anchor: anchor ? new google.maps.Point(80, 75) : null,
      },
      position: type === MarkerType.main
        ? { lat: item.lat, lng: item.lon } : { lat: this.selectedOffice.lat, lng: this.selectedOffice.lon },
      id: type === MarkerType.main ? null : this.markerId,
      type: type,
    };
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

  public markerClick(marker, m, inf): void {
    inf.position = marker.getPosition();
    inf.open();
    inf.infoWindow.setOptions({ pixelOffset: new google.maps.Size(0, -60) });
  }

  public onApplyInfoWindows(polyline): void {
    this.infoWindow.close();
    this.selectedPolyline.setOptions({ icons: [] });
    this.selectedPolyline = null;
    this._locService.excludedCommutes$.next([polyline.commuteUid]);
  }

  public polylineDblclick(polyline, infowindow, p): void {
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
    const bounds = new google.maps.LatLngBounds();
    polyline.getPath().getArray().forEach((latLng) => {
      bounds.extend(latLng);
    });

    const center = bounds.getCenter();
    this.map.googleMap.setCenter(center);

    if (this.selectedInfoWindow) {

      this.selectedInfoWindow.close();
    }

    this.selectedInfoWindow = infowindow;
    infowindow.position = center;
    infowindow.infoWindow.setOptions({ pixelOffset: new google.maps.Size(0, 280) });
    infowindow.open();
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
    this.dataSource && this.map.fitBounds(this.bounds);
  }

  private createPolylineOptions(item: any): PolylineOptions {
    return this.polylineOptions = {
      strokeColor: item.commuteCO2Quartile,
      strokeWeight: 4,
      zIndex: 10,
      path: this.convertLatLng(item),
      commuteUid: item.commuteUid,
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
export interface PolylineOptions extends google.maps.PolylineOptions {
  commuteUid?: string;
}

export interface MarkerOptions extends google.maps.MarkerOptions {
  forecastPerDay?: number;
  forecastPerWeek?: number;
  id?: number;
  type?: MarkerType;
  data?: any;
}


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
import { Utils } from '../../../../../app/services/utils';
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
  public selectedOffice: any;
  public overlay: google.maps.OverlayView;

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
      subscribe((data: any) => {
        this.dataSource = data;
        this.cdr.detectChanges();
        this.removeMapObject();
        (this.dataSource.allOffices && this.isAddMarker) && this.buildMarker();
        this.dataSource.nearbies && this.buildCircle();
        this.dataSource.commutes && this.buildPolylines();
        this.createInfoWindow();

        (this.dataSource?.forecastPoints && this.forcastMarker.length) && this.buildForecastPoint();

        this.selectedOffice = this.dataSource.allOffices.find((item) => item.isSelected);
        this.isAddMarker = false;
      });

    this._locService.actionAddPoint$.pipe(
      filter(Boolean),
      takeUntil(this.destroy$),
    ).
      subscribe((data: any) => {
        this.selectedOffice && this.addOffice();
        this.selectedOffice && this._locService.addForecastPoint$.next(this.buildForcast());
      });

    this._locService.isRemoveMarker$.pipe(
      takeUntil(this.destroy$),
    ).
      subscribe((data: any) => {
        data && this.removeForecast();
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
    this.dataSource?.forecastPoints
      && this.dataSource?.forecastPoints.forEach((value, index) => {
        this.forcastMarker[index].data = value;
      });
  }

  public onMapClick(): void {
    this.selectedInfoWindow && this.selectedInfoWindow.close();
    this.selectedPolyline && this.selectedPolyline.setOptions({ icons: [] });
    this.selectedPolyline = null;
    this.cdr.detectChanges();
  }

  public onShowStatsMarker(item): void {
    item.info.position = item.position;
    item.info.open();
    item.info.infoWindow.setOptions({ pixelOffset: new google.maps.Size(0, -60) });
  }

  public onShowStatsPolyline(item) {
    const bounds = new google.maps.LatLngBounds();
    item.polyline.getPath().getArray().forEach((latLng) => {
      bounds.extend(latLng);
    });

    const center = bounds.getCenter();
    this.map.googleMap.setCenter(center);

    this.selectedInfoWindow && this.selectedInfoWindow.close();

    this.selectedInfoWindow = item.infowindow;
    item.infowindow.position = center;
    item.infowindow.open();
    this.cdr.detectChanges();
  }

  public onMapRightclick(event, m, info): void {
    console.log(m)
    const inf = { ...m, info, type: 'marker' };
    this.contextMenuPosition.x = `${event.domEvent.clientX}px`;
    this.contextMenuPosition.y = `${event.domEvent.clientY}px`;
    this.contextMenu.menuData = { item: inf };
    this.contextMenu.openMenu();
  }

  public onPolylineRightclick(event, polyline, infowindow): void {
    const inf = { ...polyline, infowindow, type: 'polyline' };
    this.contextMenuPosition.x = `${event.domEvent.clientX}px`;
    this.contextMenuPosition.y = `${event.domEvent.clientY}px`;
    this.contextMenu.menuData = { item: inf };
    this.contextMenu.openMenu();

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
    this.selectedInfoWindow && this.selectedInfoWindow.close();

    this.cdr.detectChanges();
  }

  public onMatmenuClose(): void {
    if (!this.selectedInfoWindow) {
      this.selectedPolyline && this.selectedPolyline.setOptions({ icons: [] });
      this.selectedPolyline = null;
      this.cdr.detectChanges();
    }
  }

  public onRemove(item): void {
    this.forcastMarker = this.forcastMarker.filter((v) => v.id !== item.id);
    this._locService.mapDrag$.next(this.buildForcast());
    this.cdr.detectChanges();
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
      const marker = this.createMarkerOptions(MarkerType.main, item);
      this.bounds.extend(marker.position);
      this.markers.push(marker);
    });

    this.dataSource.forecastPoints.forEach((item) => {
      const marker = this.createMarkerOptions(MarkerType.virtual, item);
      this.bounds.extend(marker.position);
      this.forcastMarker.push(marker);
    });

    this.cdr.detectChanges();
  }

  public createMarkerOptions(type: MarkerType, item?): MarkerOptions {
    const LatLng = type === MarkerType.virtual
      && this.convertOffset(new google.maps.LatLng(this.selectedOffice.lat, this.selectedOffice.lon), 50, 0);
    return this.markerOptions = {
      draggable: type === MarkerType.virtual,
      crossOnDrag: false,
      icon: {
        url: type === MarkerType.main ? MarkerTypeIcon.mainOffice : MarkerTypeIcon.virtualOffice,
      },
      position: type === MarkerType.main
        ? { lat: item.lat, lng: item.lon } :
        { lat: LatLng.lat(), lng: LatLng.lng() },
      id: type === MarkerType.main ? null : this.markerId,
      type: type,
    };
  }


  public convertOffset(latlng: google.maps.LatLng, offsetX: number, offsetY: number): google.maps.LatLng {

    const scale = Math.pow(2, this.map.googleMap.getZoom());

    const worldCoordinateCenter = this.map.googleMap.getProjection().fromLatLngToPoint(latlng);
    const pixelOffset = new google.maps.Point((offsetX / scale) || 0, (offsetY / scale) || 0);

    const worldCoordinateNewCenter = new google.maps.Point(
      worldCoordinateCenter.x - pixelOffset.x,
      worldCoordinateCenter.y + pixelOffset.y,
    );
    return this.map.googleMap.getProjection().fromPointToLatLng(worldCoordinateNewCenter);
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

  public onApplyInfoWindows(polyline): void {
    this.infoWindow.close();
    this.selectedPolyline.setOptions({ icons: [] });
    this.selectedPolyline = null;
    this._locService.changedCommute$.next([{ commuteUid: polyline.commuteUid, officeDays: this.sliderOptions.value }]);
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
    (this.dataSource && this.isAddMarker) && this.map.fitBounds(this.bounds);
  }

  public removeForecast(): void {
    const copyMarker = Utils.deepCopy(this.forcastMarker);
    this.forcastMarker = [];
    !!copyMarker.length && this._locService.mapDrag$.next(this.buildForcast());
    this.cdr.detectChanges();
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


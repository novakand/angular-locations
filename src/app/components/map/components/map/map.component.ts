import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

// external lib
import { GoogleMap, MapInfoWindow, MapMarker, MapPolyline } from '@angular/google-maps';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { MatMenuTrigger } from '@angular/material/menu';
import { Utils } from '../../../../../app/services/utils';

// services
import { LocationsService } from '../../../../components/locations/services/locations.service';

// enums
import { MarkerType } from '../../enums/marker-type.enum';

// interfaces
import { IMarkerOptions } from '../../interfaces/marker-options.interface';
import { IPolylineOptions } from '../../interfaces/polyline-options.interface';
import { ISliderOptions } from '../../../../components/locations/interfaces/slider-optios.interface';
import { IAllOffices } from 'src/app/components/locations/interfaces/all-offices.interface';
import { IFilterResponse } from 'src/app/components/locations/interfaces/filter-response.interface';
import { IInfoWindow } from '../../interfaces/info-windows.interface';
import { IFilterUploadResponse } from 'src/app/components/locations/interfaces/filter-upload-response.interface';
import { IItemPoint } from '../../interfaces/item-point.interface';
import { INearby } from '../../../../components/locations/interfaces/nearby.interface';
import { MapBuilder } from './map.builder';
import { IForecastPointsRes } from 'src/app/components/locations/interfaces/forecast-point.interfaces';
@Component({
  selector: 'fatma-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  providers: [MapBuilder, GoogleMap],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent implements OnInit, OnDestroy {

  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
  @ViewChild(MapInfoWindow, { static: false }) infoWindow: MapInfoWindow;
  @ViewChild(MatMenuTrigger) public contextMenu: MatMenuTrigger;

  public isAddMarker = true;
  public markerId = 0;
  public markers: IMarkerOptions[] = [];
  public forcastMarker: IMarkerOptions[] = [];
  public circles: google.maps.CircleOptions[] = [];
  public polylines: google.maps.PolygonOptions[] = [];
  public circleOptions: google.maps.CircleOptions = {};
  public markerOptions: IMarkerOptions = {};
  public polylineOptions: IPolylineOptions = {};
  public dataSource: IFilterResponse;
  public isChekedForecast = false;
  public isBuildMarker = true;
  public contextMenuPosition = { x: '0px', y: '0px' };
  public selectedOffice: IAllOffices;
  public cO2Emission: number = null;
  public cO2EmissionVirtual: number = null;
  public titleContexMenu: string;

  public sliderOptions: ISliderOptions = {
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
    zoom: 3,
    disableDefaultUI: true,
    minZoom: 3,
    disableDoubleClickZoom: false,
    clickableIcons: false,
  };

  public bounds: google.maps.LatLngBounds;
  private _selectedPolyline: google.maps.Polyline;
  private _selectedInfoWindow: google.maps.InfoWindow;

  private _destroy$ = new Subject<boolean>();

  constructor(
    private _service: LocationsService,
    private _builder: MapBuilder,
    private _cdr: ChangeDetectorRef,
  ) {

    this._builder.cmp = this;
  }

  public ngOnInit(): void {

    this.bounds = new google.maps.LatLngBounds();

    this._watchForFilterUpdateChanges();
    this._watchForUploadChanges();
    this._watchForAddPointChanges();
    this._watchForRemovePointChanges();
    this._watchForIsForecastChanges();
  }

  public buildForecastPoint(): void {
    !!this.dataSource?.forecastPoints.length
      && this.dataSource?.forecastPoints?.forEach((value, index) => {
        this.forcastMarker[index].data = value;
      });

    this._service.addForecastPoint$.next(this.buildForc());
  }

  public onMapClick(): void {
    this._selectedInfoWindow && this._selectedInfoWindow.close();
    this._selectedPolyline && this._selectedPolyline.setOptions({ icons: [] });
    this._selectedPolyline = null;
    this._cdr.detectChanges();
  }

  public onInfoWindowOpen(item: IItemPoint): void {
    this.cO2EmissionVirtual = item.data ? item.data.cO2WeeklyEmission : this.cO2Emission;
    item.info.isOpen ? item.info.close() : item.info.open(item.marker);
    item.info.isOpen = !item.info.isOpen;
  }

  public onMapRightclick(event: google.maps.MapMouseEvent, opts: IMarkerOptions, info: IInfoWindow, marker: MapMarker): void {
    const item = { ...opts, info, type: 'marker', marker };
    this.contextMenuPosition.x = `${(<MouseEvent>event.domEvent).clientX}px`;
    this.contextMenuPosition.y = `${(<MouseEvent>event.domEvent).clientY}px`;
    this.contextMenu.menuData = { item };
    this.titleContexMenu = !info.isOpen ? 'Show stats' : 'Hide stats';
    this.contextMenu.openMenu();
  }

  public onPolylineRightclick(poly: MapPolyline, info: IInfoWindow, opts: IPolylineOptions): void {
    if (!this.isChekedForecast) { return; }

    const center = this._boundsPolyline(poly).getCenter();

    this._selectedInfoWindow && this._selectedInfoWindow.close();
    this.sliderOptions.value = opts.data.officeDays;
    this._selectedInfoWindow = info.infoWindow;
    info.infoWindow.setPosition(center);
    info.open();
    this._cdr.detectChanges();

    this._selectedPolyline && this._selectedPolyline.setOptions({ icons: [] });
    poly.polyline.setOptions({ icons: [{ icon: this._iconSelectedPolyline(), offset: '0', repeat: '2px', }] });
    this._selectedPolyline = poly.polyline;
    this._cdr.detectChanges();
  }

  public onMatmenuClose(): void {
    if (!this._selectedInfoWindow) {
      this._selectedPolyline && this._selectedPolyline.setOptions({ icons: [] });
      this._selectedPolyline = null;
      this._cdr.detectChanges();
    }
  }

  public onRemove(opts: IMarkerOptions): void {
    this.forcastMarker = this.forcastMarker.filter((value) => value.id !== opts.id);
    this._service.mapDrag$.next(this.buildForcast());
    this._service.addForecastPoint$.next(this.buildForc());
    this._cdr.detectChanges();
  }

  public draggableChanged(mapMarker: MapMarker, opts: IMarkerOptions): void {
    const marker = this.forcastMarker?.find((mark) => mark.id === opts.id);
    marker.position.lat = mapMarker.getPosition().lat();
    marker.position.lng = mapMarker.getPosition().lng();
    this._service.mapDrag$.next(this.buildForcast());
  }

  public buildForcast(): IForecastPointsRes[] {
    const forMarker = [];
    this.forcastMarker && this.forcastMarker.forEach((value) => {
      forMarker.push({ lat: value.position.lat, lon: value.position.lng, });
    });
    return forMarker;
  }

  public buildForc(): any[] {
    const forMarker = [];
    this.forcastMarker && this.forcastMarker.forEach((value) => {
      forMarker.push({ data: value.data ? value.data : null, lat: value.position.lat, lon: value.position.lng, });
    });
    return forMarker;
  }

  public removeMapObject(): void {
    this.circles = [];
    this.polylines = [];
    this._cdr.detectChanges();
  }

  public addOffice(): void {
    this.markerId++;
    const marker = this._builder.createMarkerOptions(MarkerType.office, true);
    this.forcastMarker.push(marker);
    this._cdr.detectChanges();
  }

  public ngOnDestroy(): void {
    this.forcastMarker = [];
    this.markers = [];
    this.circles = [];
    this.polylines = [];
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public onApply(opts: IPolylineOptions): void {
    this.infoWindow.close();
    this._selectedPolyline.setOptions({ icons: [] });
    this._selectedPolyline = null;
    this._service.changedCommute$.next([{ commuteUid: opts.data.commuteUid, officeDays: this.sliderOptions.value }]);
    this._selectedInfoWindow && this._selectedInfoWindow.close();
    this._cdr.detectChanges();
  }

  public buildForecastPoints(): void {
    this.dataSource.forecastPoints?.forEach((item: any) => {
      this.markerId++;
      const marker = item.data ? this._builder.updateMarker(MarkerType.virtual, item) : this._builder.updateMarker(MarkerType.office, item);
      this.bounds.extend(marker.position);
      this.forcastMarker.push(marker);
    });
  }

  public buildMarker(): void {
    this.dataSource.allOffices.forEach((item: IAllOffices) => {
      const marker = this._builder.createMarkerOptions(MarkerType.virtual, item);
      this.bounds.extend(marker.position);
      this.markers.push(marker);
    });
    this._cdr.detectChanges();
  }

  public buildCircle(): void {
    this.dataSource?.nearbies?.forEach((item) => {
      this.addCircle(item);
    });
  }

  public addCircle(item: INearby): void {
    this.circles.push(this._builder.createCircleOptions(item));
  }

  private _boundsPolyline(polyline: MapPolyline): google.maps.LatLngBounds {
    const bounds = new google.maps.LatLngBounds();

    polyline.getPath().getArray().forEach((latLng: google.maps.LatLng) => {
      bounds.extend(latLng);
    });

    return bounds;
  }

  private _createInfoWindowOpt(): void {
    this.infoWindowOptions = {};
    this.infoWindowOptions.pixelOffset = new google.maps.Size(0, 10);
    this.infoWindowOptions.disableAutoPan = true;
    this.infoWindowOptions.zIndex = 100;
  }

  private _iconSelectedPolyline(): google.maps.Symbol {
    return {
      path: 'M 0,-1 0,1',
      strokeOpacity: 0.4,
      strokeColor: 'blue',
      strokeWeight: 12,
      scale: 4,
    };
  }

  private _fitBounds(): void {
    (this.dataSource && this.isAddMarker) && this.map.fitBounds(this.bounds);
  }

  private _removeForecast(): void {
    const copyMarker = Utils.deepCopy(this.forcastMarker);
    this.forcastMarker = [];
    !!copyMarker.length && this._service.mapDrag$.next(this.buildForcast());
    this._cdr.detectChanges();
  }

  private _watchForIsForecastChanges(): void {
    this._service.isChekedForecast$
      .pipe(
        takeUntil(this._destroy$),
      ).
      subscribe((data: boolean) => {
        this.isBuildMarker = data;
        this.isChekedForecast = data;
      });
  }

  private _watchForRemovePointChanges(): void {
    this._service.isRemoveMarker$
      .pipe(
        takeUntil(this._destroy$),
      ).
      subscribe((data: boolean) => {
        data && this._removeForecast();
      });
  }

  private _watchForAddPointChanges(): void {
    this._service.actionAddPoint$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      ).
      subscribe((data: boolean) => {
        this.selectedOffice && this.addOffice();
        this.selectedOffice && this._service.addForecastPoint$.next(this.buildForc());
      });
  }

  private _watchForUploadChanges(): void {
    this._service.queryUpload$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      ).
      subscribe((data: IFilterUploadResponse) => {
        data?.forecastPoints && this.buildForecastPoints();
        this._cdr.detectChanges();
      });
  }

  private _watchForFilterUpdateChanges(): void {
    this._service.query$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      ).
      subscribe((data: IFilterResponse) => {
        this.dataSource = data;
        this._cdr.detectChanges();
        this.removeMapObject();
        (this.dataSource.allOffices && this.isAddMarker) && this.buildMarker();
        this.dataSource.nearbies && this.buildCircle();
        this.dataSource.commutes && this.buildPolylines();
        this._createInfoWindowOpt();

        (!!this.dataSource?.forecastPoints?.length && !!this.forcastMarker.length) && this.buildForecastPoint();
        this._selectedOffice();
        this.isAddMarker = false;
        this.cO2Emission = !this.selectedOffice?.calcCO2WeeklyEmission
          ? this.selectedOffice?.originalCO2WeeklyEmission : this.selectedOffice?.calcCO2WeeklyEmission;
      });
  }

  private _selectedOffice(): void {
    this.selectedOffice = this.dataSource.allOffices.find((item) => item.isSelected);
  }

  private buildPolylines(): void {
    this.dataSource?.commutes?.forEach((item) => {
      this.polylines.push(this._builder.createPolylineOptions(item));
    });
    (!!this.dataSource?.commutes.length) && this._fitBounds();
    this._cdr.detectChanges();
  }
}

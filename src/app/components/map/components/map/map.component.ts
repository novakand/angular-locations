import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { LocationsService } from '../../../../components/locations/services/locations.service';
import { MatMenuTrigger } from '@angular/material/menu';

// enums
import { MarkerTypeIcon } from '../../enums/marker-icon-type.enums';
import { MarkerType } from '../../enums/marker-type';
import { Utils } from '../../../../../app/services/utils';
import { IMarkerOptions } from '../../interfaces/marker-options.interface';
import { IPolylineOptions } from '../../interfaces/polyline-options.interface';
import { ColorsType } from '../../enums/color-type.enum';
import { ISliderOptions } from '../../../../components/locations/interfaces/slider-optios.interface';
import { IAllOffices } from 'src/app/components/locations/interfaces/all-offices.interface';
import { IFilterResponse } from 'src/app/components/locations/interfaces/filter-response.interface';
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
  public markerId = 0;
  public restangle: google.maps.RectangleOptions;
  public markers: IMarkerOptions[] = [];
  public forcastMarker: IMarkerOptions[] = [];
  public circles: google.maps.CircleOptions[] = [];
  public polylines: google.maps.PolygonOptions[] = [];
  public infoWindowBox: google.maps.InfoWindow[] = [];
  public selectedPolyline: any;
  public selectedInfoWindow: any;
  public selectedInfoWindowMarker: any;
  public visible: boolean;
  public center: google.maps.LatLng;
  public isChekedForecast = false;
  public isBuildMarker = true;
  public contextMenuPosition = { x: '0px', y: '0px' };
  public selectedOffice: IAllOffices;
  public overlay: google.maps.OverlayView;
  public cO2Emission: number = null;
  public cO2EmissionVirtual: number = null;

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

  public circleOptions: google.maps.CircleOptions = {};
  public markerOptions: IMarkerOptions = {};
  public polylineOptions: IPolylineOptions = {};
  public bounds: google.maps.LatLngBounds;
  public dataSource: any;

  private _destroy$ = new Subject<boolean>();

  constructor(
    private _service: LocationsService,
    private _cdr: ChangeDetectorRef,
  ) { }

  public ngOnInit(): void {

    this.bounds = new google.maps.LatLngBounds();
    this._service.takeFilter$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      ).
      subscribe((data: any) => {
        this.dataSource = data;
        this._cdr.detectChanges();
        this.removeMapObject();
        (this.dataSource.allOffices && this.isAddMarker) && this.buildMarker();
        this.dataSource.nearbies && this.buildCircle();
        this.dataSource.commutes && this.buildPolylines();
        this.createInfoWindow();

        (!!this.dataSource?.forecastPoints?.length && !!this.forcastMarker.length) && this.buildForecastPoint();

        this.selectedOffice = this.dataSource.allOffices.find((item) => item.isSelected);
        this.isAddMarker = false;
        this.cO2Emission = !this.selectedOffice?.calcCO2WeeklyEmission
          ? this.selectedOffice?.originalCO2WeeklyEmission : this.selectedOffice?.calcCO2WeeklyEmission;
      });

    this._service.filter$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      ).
      subscribe((data: any) => {

        data?.forecastPoints && this.buildForecastPoints();

        this._cdr.detectChanges();
      });

    this._service.actionAddPoint$.pipe(
      filter(Boolean),
      takeUntil(this._destroy$),
    ).
      subscribe((data: any) => {
        this.selectedOffice && this.addOffice();
        this.selectedOffice && this._service.addForecastPoint$.next(this.buildForc());
      });

    this._service.isRemoveMarker$.pipe(
      takeUntil(this._destroy$),
    ).
      subscribe((data: any) => {
        data && this.removeForecast();
      });

    this._service.isChekedForecast$
      .pipe(
        takeUntil(this._destroy$),
      ).
      subscribe((data: any) => {
        this.isBuildMarker = data;
        this.isChekedForecast = data;
      });
  }

  public buildForecastPoint(): void {
    !!this.dataSource?.forecastPoints.length
      && this.dataSource?.forecastPoints?.forEach((value, index) => {
        console.log(value, 'value')
        this.forcastMarker[index].data = value;
      });

    this._service.addForecastPoint$.next(this.buildForc());

    console.log(this.forcastMarker, 'this.forcastMarker')
  }

  public createForecastOptions(type: MarkerType, item?): IMarkerOptions {
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

  public onMapClick(): void {
    this.selectedInfoWindow && this.selectedInfoWindow.close();
    this.selectedPolyline && this.selectedPolyline.setOptions({ icons: [] });
    this.selectedPolyline = null;
    this._cdr.detectChanges();
  }

  public onShowStatsMarker(item): void {
    item.info.open(item.marker);
    this.cO2EmissionVirtual = item.data ? item.data.cO2WeeklyEmission : this.cO2Emission;
  }

  public onMapRightclick(event, m, info, marker): void {
    const inf = { ...m, info, type: 'marker', marker };
    this.contextMenuPosition.x = `${event.domEvent.clientX}px`;
    this.contextMenuPosition.y = `${event.domEvent.clientY}px`;
    this.contextMenu.menuData = { item: inf };
    this.contextMenu.openMenu();
  }

  public onPolylineRightclick(polyline, infowindow, item): void {
    if (!this.isChekedForecast) { return; }

    const bounds = new google.maps.LatLngBounds();
    polyline.getPath().getArray().forEach((latLng) => {
      bounds.extend(latLng);
    });

    const center = bounds.getCenter();
    this.selectedInfoWindow && this.selectedInfoWindow.close();
    this.sliderOptions.value = item.data.officeDays;
    this.selectedInfoWindow = infowindow.infoWindow;
    infowindow.infoWindow.position = center;
    infowindow.open();
    this._cdr.detectChanges();

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
    this._cdr.detectChanges();
  }

  public onMatmenuClose(): void {
    if (!this.selectedInfoWindow) {
      this.selectedPolyline && this.selectedPolyline.setOptions({ icons: [] });
      this.selectedPolyline = null;
      this._cdr.detectChanges();
    }
  }

  public onRemove(item): void {
    this.forcastMarker = this.forcastMarker.filter((v) => v.id !== item.id);
    this._service.mapDrag$.next(this.buildForcast());
    this._service.addForecastPoint$.next(this.buildForc());
    this._cdr.detectChanges();
  }

  public draggableChanged(marker: any, m): void {
    const mm = this.forcastMarker?.find((mark) => mark.id === m.id);
    mm.position.lat = marker.getPosition().lat();
    mm.position.lng = marker.getPosition().lng();
    this._service.mapDrag$.next(this.buildForcast());
    this.selectedInfoWindowMarker && this.selectedInfoWindowMarker.close();
  }

  public buildForcast(): any[] {
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

  public createInfoWindow() {
    this.infoWindowOptions = {};
    this.infoWindowOptions.pixelOffset = new google.maps.Size(0, 10);
    this.infoWindowOptions.disableAutoPan = false;
    this.infoWindowOptions.zIndex = 100;
  }

  public removeMapObject(): void {
    this.circles = [];
    this.polylines = [];
    this._cdr.detectChanges();
  }

  public addOffice(): void {
    this.markerId++;
    const marker = this.createMarkerOptions(MarkerType.virtual, true);
    this.forcastMarker.push(marker);
    this._cdr.detectChanges();
  }

  public ngOnDestroy(): void {
    this.markers = [];
    this.circles = [];
    this.polylines = [];
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public buildForecastPoints(): void {
    this.dataSource.forecastPoints?.forEach((item) => {
      this.markerId++;
      const marker = item.data ? this.updateMarker(MarkerType.main, item) : this.updateMarker(MarkerType.virtual, item);
      this.bounds.extend(marker.position);
      this.forcastMarker.push(marker);
    });

  }

  public updateMarker(type: MarkerType, item?): IMarkerOptions {
    const LatLng = type === MarkerType.virtual
      && this.convertOffset(new google.maps.LatLng(item.lat, item.lon), 50, 0);
    return this.markerOptions = {
      draggable: true,
      crossOnDrag: false,
      icon: {
        url: MarkerTypeIcon.virtualOffice,
      },
      position: type === MarkerType.main
        ? { lat: item.lat, lng: item.lon } :
        { lat: LatLng.lat(), lng: LatLng.lng() },
      id: this.markerId,
      type: MarkerType.virtual,
    };
  }

  public buildMarker(): void {
    this.dataSource.allOffices.forEach((item) => {
      const marker = this.createMarkerOptions(MarkerType.main, item);
      this.bounds.extend(marker.position);
      this.markers.push(marker);
    });
    this._cdr.detectChanges();
  }

  public createMarkerOptions(type: MarkerType, item?): IMarkerOptions {
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
    this._service.changedCommute$.next([{ commuteUid: polyline.data.commuteUid, officeDays: this.sliderOptions.value }]);
    this.selectedInfoWindow && this.selectedInfoWindow.close();
    this._cdr.detectChanges();
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
    !!copyMarker.length && this._service.mapDrag$.next(this.buildForcast());
    this._cdr.detectChanges();
  }

  private createPolylineOptions(item: any): IPolylineOptions {
    return this.polylineOptions = {
      strokeColor: ColorsType[item.commuteCO2Quartile],
      strokeWeight: 4,
      zIndex: 10,
      path: this.convertLatLng(item),
      data: item,
    };
  }

  private buildPolylines(): void {
    this.dataSource?.commutes?.forEach((item) => {
      this.polylines.push(this.createPolylineOptions(item));
    });
    (!!this.dataSource?.commutes.length) && this.fitBounds();
    this._cdr.detectChanges();
  }
}

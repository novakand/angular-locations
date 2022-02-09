import { Component, OnInit, ViewChild } from '@angular/core';
import { MapMarker } from '@angular/google-maps';
import { MapInfoBoxComponent } from '../map-info-box/map-info-box.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  @ViewChild(MapInfoBoxComponent) infoWindow: MapInfoBoxComponent;

  public mapOptions: google.maps.MapOptions = {
    center: { lat: 37.772, lng: -122.214 },
    restriction: { strictBounds: false, latLngBounds: { north: 83.8, south: -83.8, west: -180, east: 180 } },
    zoom: 8,
    disableDefaultUI: true,
    minZoom: 3,
  };

  public polylineOptions = {
    strokeColor: '#1471ea',
    strokeOpacity: 0.8,
    fillColor: '#1471ea',
    fillOpacity: 0.2
  };

  public vertices: google.maps.LatLngLiteral[] = [
    { lat: 37.772, lng: -122.214 },
    { lat: 21.291, lng: -157.821 },
    { lat: -18.142, lng: 178.431 },
    { lat: -27.467, lng: 153.027 },
  ];

  public markerOptions: google.maps.MarkerOptions = { draggable: false, icon: 'data:image/png;base64,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' };
  public markerPositions: google.maps.LatLngLiteral[] = [{ lat: 37.772, lng: -122.214 },
  { lat: 21.291, lng: -157.821 },
  { lat: -18.142, lng: 178.431 },
  { lat: -27.467, lng: 153.027 }];

  public circleOptions: google.maps.CircleOptions = {
    strokeColor: '#1471ea',
    strokeOpacity: 0.8,
    fillColor: '#1471ea',
    fillOpacity: 0.2
    ,
  };
  public circleCenter: google.maps.LatLngLiteral = { lat: 37.772, lng: -122.214 };
  public radius = 300000;

  // tslint:disable-next-line: typedef
  public addMarker(event: google.maps.MapMouseEvent) {
    console.log(event, 'event');
    this.markerPositions.push(event.latLng.toJSON());
  }

  // tslint:disable-next-line: typedef
  openInfoWindow(marker: MapMarker) {
    // this.infoWindow.open(marker);
  }


  constructor() { }

  public ngOnInit(): void {

  }

}

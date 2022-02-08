import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  public mapOptions: google.maps.MapOptions = {
    zoom: 8,
    disableDefaultUI: true,
  };

  constructor() { }

  public ngOnInit(): void {
  }

}

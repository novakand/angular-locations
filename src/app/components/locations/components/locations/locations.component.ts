
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FilterResponce } from '../../interfaces/filter-responce.interfaces';

// services
import { LocationsService } from '../../services/locations.service';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
  providers: [LocationsService],
})
export class LocationsComponent implements OnInit {

  constructor(
    private filter: LocationsService,
  ) { }
  public isProgress = false;
  public dataFilterLocation: FilterResponce;
  public points = {};

  public ngOnInit(): void {
    this.filter.getLocations({
      orgUid: '22cf31c2-9eea-460f-a489-c75a5d1dd2c9',
      officeName: 'Paris HQ',
      cO2KgWeeklyMin: 0,
      cO2KgWeeklyMax: 1000000,
      transports: [
        'public_transport',
        'car',
        'taxi',
        'e_car',
        'e_bike',
        'bike',
        'bicycle',
        'walk'
      ],
      nearbyKm: 2,
      nearbyHomes: 2,
      forecastPointLon: 2.538979,
      forecastPointLat: 48.79875,
      showCommutes: [],
      excludedCommutes: null,
      MoveTypeEnumstring: [],
      CommuteCO2WeightEnumstring: []
    }).subscribe((result) => {
      this.dataFilterLocation = result;
      this.isProgress = true;
      console.log(result, 'result');
    });
  }

  // tslint:disable-next-line: typedef
  public addPoints() {
    this.points = {};
  }

}

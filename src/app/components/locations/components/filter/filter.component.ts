import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';

// enums
import { FilterSliderType } from '../../enums/filter-slider-type.enums';
import { FilterResponce } from '../../interfaces/filter-responce.interfaces';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {

  @Input() public dataFilterLocation: FilterResponce;

  @Output() public addPoints = new EventEmitter<void>();

  public isChekedTransport = false;
  public isNearbyHomes = false;
  public isChekedForecast = false;
  public value = 0;
  public highValue = 13875;
  public isFilterShow = false;
  public currentCO2KmValue = 0;
  public currentValue = 0;
  public sliderType = FilterSliderType;

  public sliderPerWeekOptions: any = {
    floor: 0,
    value: 0,
    ceil: 13875,
    minRange: 0,
    maxRange: 13875,
    hideLimitLabels: true,
    hidePointerLabels: true,
  };

  public sliderNearbyKmOptions: any = {
    floor: 0,
    value: 4,
    ceil: 16,
    disabled: true,
    minRange: 0,
    maxRange: 16,
    hideLimitLabels: true,
    hidePointerLabels: true,
  };

  public sliderNearbyHomesOptions: any = {
    floor: 0,
    value: 0,
    ceil: 5,
    disabled: true,
    minRange: 0,
    maxRange: 5,
    highValue: 5,
    steps: 1,
    hideLimitLabels: true,
    hidePointerLabels: true,
  };

  constructor() { }

  ngOnInit(): void { }

  // tslint:disable-next-line: use-lifecycle-interface
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.dataFilterLocation && changes.dataFilterLocation.currentValue) {
    }
  }

  public fieldsChange(event) {
    this.sliderNearbyKmOptions = Object.assign({}, this.sliderNearbyKmOptions, { disabled: !event.currentTarget.checked });
    this.sliderNearbyHomesOptions = Object.assign({}, this.sliderNearbyHomesOptions, { disabled: !event.currentTarget.checked });
    //event.currentTarget.checked
  }

  // tslint:disable-next-line: typedef
  public toggleFilter() {
    this.isFilterShow = !this.isFilterShow;
  }

  // tslint:disable-next-line: typedef
  public onUserChange(event, filterType: FilterSliderType) { }

  public addPoint(): void {
    this.addPoints.emit();
  }
}

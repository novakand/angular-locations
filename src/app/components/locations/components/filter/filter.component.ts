import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';

import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

// external libs
import { Subject, Subscription } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';

// enums
import { FilterSliderType } from '../../enums/filter-slider-type.enums';
import { MoveTypeEnumstring } from '../../enums/move-type.enums';

// interfaces
import { FilterResponce } from '../../interfaces/filter-responce.interfaces';

// models
import { FilterRequest } from '../../models/qure.model';

// services
import { LocationsService } from '../../services/locations.service';
@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterComponent implements OnInit, OnDestroy {

  @Input() public dataFilterLocation: FilterResponce;

  @Output() public addPoints = new EventEmitter<void>();

  public TransportType = MoveTypeEnumstring;
  public sortedWeekdays = [];
  public filterForm: FormGroup;
  public isChekedTransport = false;
  public isNearbyHomes = false;
  public isChekedForecast = false;
  public value = 0;
  public highValue = 13875;
  public isFilterShow = false;
  public currentCO2KmValue = 0;
  public currentValue = null;
  public sliderType = FilterSliderType;
  public subscription: Subscription;
  public commutes: [] = [];

  public sliderPerWeekOptions: any = {
    floor: 0,
    value: 100000,
    ceil: 100000,
    minRange: 0,
    maxRange: 100000,
    hideLimitLabels: true,
    hidePointerLabels: true,
    showSelectionBar: true,
    step: 1,
  };

  public sliderNearbyKmOptions: any = {
    floor: 0,
    value: 12,
    ceil: 16,
    disabled: true,
    minRange: 3,
    maxRange: 16,
    hideLimitLabels: true,
    hidePointerLabels: true,
    showSelectionBar: true,
    step: 1,
  };

  public sliderNearbyHomesOptions: any = {
    floor: 0,
    value: 1,
    ceil: 50,
    disabled: true,
    minRange: 1,
    maxRange: 50,
    highValue: 12,
    minLimit: 1,
    steps: 1,
    hideLimitLabels: true,
    showSelectionBar: true,
    hidePointerLabels: true,
  };

  private _destroy$ = new Subject<boolean>();


  constructor(
    private fb: FormBuilder,
    private _locService: LocationsService,
  ) { }

  public ngOnInit(): void {
    this.currentValue = `${this.sliderNearbyHomesOptions.value}-${this.sliderNearbyHomesOptions.highValue}`;
    this.buildForm();
    this.filterForm.get('transports').disable({ emitEvent: false });

    this.filterForm.valueChanges.pipe(
      filter((value) => !!value),
      debounceTime(1000),
      takeUntil(this._destroy$),
    ).subscribe((value) => this.sendFilter());

    this._locService.actionCommutes$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      ).
      subscribe((data: any) => {
        this.commutes = data;
        this.sendFilter();
      });

  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public sendFilter(): void {

    this._locService.actionPreloader$.next(true);

    const defaultParam = {
      orgUid: '22cf31c2-9eea-460f-a489-c75a5d1dd2c9',
      officeUid: '22cf31c2-9eea-460f-a489-c75a5d1dd2c9',
      cO2KgWeeklyMin: 0,
      forecastPointLon: 2.538979,
      forecastPointLat: 48.79875,
      nearbyHomesCountMin: this.isNearbyHomes ? this.sliderNearbyHomesOptions.value : null,
      nearbyHomesCountMax: this.isNearbyHomes ? this.sliderNearbyHomesOptions.highValue : null,
      transports: this.getTransport(),
      showCommutes: this.commutes,
      excludedCommutes: null,

    };



    const filterParam = {
      ...this.filterForm.value,
      ...defaultParam,
    };

    console.log('filterParam', filterParam);

    this._locService.filterUpdateAsync(filterParam)
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      )
      .subscribe((data: any) => {
        console.log(data, ' RESPONSE');
        this._locService.actionPreloader$.next(false);
      });
  }


  public getTransport() {
    const transport = this.filterForm.get('transports').value.filter((value) => !!value);
    return !transport.length ? ['notSet'] : transport;
  }

  public buildFieldsTransport(): any {
    return Object.values(this.TransportType).map((x) => false);

  }

  public fieldListener(): void {
    const checkboxControl = this.filterForm.get('transports');
    checkboxControl.valueChanges.subscribe(() => {
      checkboxControl.setValue(
        checkboxControl.value.map((value: any, i: string | number) => value ? Object.values(this.TransportType)[i] : false),
        { emitEvent: false },
      );
    });

  }

  public buildForm(): void {
    this.filterForm = this.fb.group({
      cO2KgWeeklyMax: new FormControl({ value: this.sliderPerWeekOptions.value }),
      nearbyKm: new FormControl({ value: this.sliderNearbyKmOptions.value, disabled: true }),
      nearbyHomesCountMin: new FormControl({ value: this.sliderNearbyKmOptions.value, disabled: true }),
      transports: this.fb.array(this.buildFieldsTransport()),
    });

    this.fieldListener();
  }

  public fieldsChangeTransport(event): void {

    event.currentTarget.checked ?
      this.filterForm.get('transports').enable({ emitEvent: false }) : this.resetFiledTransport();
  }

  public resetFiledTransport(): void {
    this.filterForm.get('transports').disable({ emitEvent: false });
    this.filterForm.get('transports').reset();
  }

  public fieldsChange(event) {
    event.currentTarget.checked ?
      this.filterForm.get('nearbyKm').enable({ emitEvent: true }) : this.filterForm.get('nearbyKm').disable({ emitEvent: true });
    event.currentTarget.checked ?
      this.filterForm.get('nearbyHomesCountMin').enable({ emitEvent: true })
      : this.filterForm.get('nearbyHomesCountMin').disable({ emitEvent: true });

    this.sliderNearbyKmOptions = { ...this.sliderNearbyKmOptions, ...{ disabled: !event.currentTarget.checked } };
    this.sliderNearbyHomesOptions = { ...this.sliderNearbyHomesOptions, ...{ disabled: !event.currentTarget.checked } };
  }


  public toggleFilter() {
    this.isFilterShow = !this.isFilterShow;
  }

  public onUserChange(event, filterType: FilterSliderType) {
    if (filterType === FilterSliderType.nearbyHomes) {
      this.currentValue = `${event.value}-${event.highValue}`;
    }
  }

  public nearbyHomesChange(event): void {
    if (event.length > 0) {
      const split = event.split('-');
      this.sliderNearbyHomesOptions.value = split[0];
      this.sliderNearbyHomesOptions.highValue = split[1];
    }
  }

  public onaddPoint(): void {
    this._locService.actionAddPoint$.next(true);
  }
}

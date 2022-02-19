import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';

// enums
import { FilterSliderType } from '../../enums/filter-slider-type.enums';
import { MoveTypeEnumstring } from '../../enums/move-type.enums';
import { FilterResponce } from '../../interfaces/filter-responce.interfaces';
import { FilterRequest } from '../../models/qure.model';
import { LocationsService } from '../../services/locations.service';
@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterComponent implements OnInit {

  @Input() public dataFilterLocation: FilterResponce;

  @Output() public addPoints = new EventEmitter<void>();

  public mokeReg: any;
  public destroy$ = new Subject<boolean>();
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

  private ftrReq: FilterRequest;

  public sliderPerWeekOptions: any = {
    floor: 0,
    value: 30,
    ceil: 13875,
    minRange: 0,
    maxRange: 13875,
    hideLimitLabels: true,
    hidePointerLabels: true,
    showSelectionBar: true,
    step: 1,
  };

  public sliderNearbyKmOptions: any = {
    floor: 0,
    value: 4,
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
    value: 5,
    ceil: 50,
    disabled: true,
    minRange: 5,
    maxRange: 50,
    highValue: 50,
    minLimit: 5,
    steps: 1,
    hideLimitLabels: true,
    showSelectionBar: true,
    hidePointerLabels: true,
  };


  constructor(
    private fb: FormBuilder,
    private ftr: LocationsService,
  ) { }

  public ngOnInit(): void {
    this.currentValue = `${this.sliderNearbyHomesOptions.value}-${this.sliderNearbyHomesOptions.highValue}`;
    this.buildForm();
    this.filterForm.get('transports').disable({ emitEvent: false });

    this.filterForm.valueChanges.pipe(
      filter(value => !!value),
      debounceTime(1000),
      takeUntil(this.destroy$),
    ).subscribe((value) => this.sendFilter());

    this.ftr.actionCommutes$
      .pipe(
        filter(Boolean),
        takeUntil(this.destroy$),
      ).
      subscribe((data: any) => {
        console.log(data);
        this.commutes = data;
        this.sendFilter();
      });

  }

  public sendFilter(): void {

    this.ftr.actionPreloader$.next(true);
    const defaultParam = {
      orgUid: '22cf31c2-9eea-460f-a489-c75a5d1dd2c9',
      officeUid: '22cf31c2-9eea-460f-a489-c75a5d1dd2c9',
      officeName: 'Paris HQ',
      nearbyHomesCountMin: this.sliderNearbyHomesOptions.value,
      nearbyHomesCountMax: this.sliderNearbyHomesOptions.highValue,
      transports: this.filterForm.get('transports').value.filter(value => !!value),
      showCommutes: this.commutes

    };

    const testParam = {
      OrgUid: '22cf31c2-9eea-460f-a489-c75a5d1dd2c9',
      CO2KgWeeklyMin: 0,
      CO2KgWeeklyMax: 1000000,
      ForecastPointLon: 2.538979,
      ForecastPointLat: 48.79875

    };


    const filterParam = {
      ...this.filterForm.value,
      ...defaultParam
    };

    console.log(filterParam, 'filterParam');

    this.ftr.filterUpdateAsync(testParam)
      .pipe(
        filter(Boolean),
        takeUntil(this.destroy$),
      )
      .subscribe((data: any) => {
        console.log(data, ' RESPONSE');
        this.ftr.actionPreloader$.next(false);
      });
  }


  public buildFieldsTransport(): any {
    return Object.values(this.TransportType).map(x => false);

  }

  public fieldListener(): void {

    const checkboxControl = this.filterForm.get('transports');
    checkboxControl.valueChanges.subscribe(() => {
      checkboxControl.setValue(
        checkboxControl.value.map((value, i) => value ? Object.values(this.TransportType)[i] : false),
        { emitEvent: false }
      );
    });

  }


  private buildForm(): void {
    this.filterForm = this.fb.group({
      cO2KgWeeklyMax: new FormControl({ value: this.sliderPerWeekOptions.value }),
      nearbyKm: new FormControl({ value: this.sliderNearbyKmOptions.value, disabled: true }),
      nearbyHomesCountMin: new FormControl({ value: this.sliderNearbyKmOptions.value, disabled: true }),
      transports: this.fb.array(this.buildFieldsTransport()),
    });

    this.fieldListener();
  }

  // tslint:disable-next-line: use-lifecycle-interface


  // tslint:disable-next-line: use-lifecycle-interface
  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public fieldsChangeTransport(event): void {

    event.currentTarget.checked ?
      this.filterForm.get('transports').enable({ emitEvent: false }) : this.resetFiledTransport();
  }

  public resetFiledTransport(): void {
    this.filterForm.get('transports').disable({ emitEvent: false });
    this.filterForm.get('transports').reset();
  }
  // tslint:disable-next-line: typedef
  public fieldsChange(event) {
    event.currentTarget.checked ?
      this.filterForm.get('nearbyKm').enable({ emitEvent: true }) : this.filterForm.get('nearbyKm').disable({ emitEvent: false });
    event.currentTarget.checked ?
      this.filterForm.get('nearbyHomesCountMin').enable({ emitEvent: true })
      : this.filterForm.get('nearbyHomesCountMin').disable({ emitEvent: false });

    this.sliderNearbyKmOptions = { ...this.sliderNearbyKmOptions, ...{ disabled: !event.currentTarget.checked } };
    this.sliderNearbyHomesOptions = { ...this.sliderNearbyHomesOptions, ...{ disabled: !event.currentTarget.checked } };
  }


  // tslint:disable-next-line: typedef
  public toggleFilter() {
    this.isFilterShow = !this.isFilterShow;
  }

  // tslint:disable-next-line: typedef
  public onUserChange(event, filterType: FilterSliderType) {
    if (filterType === FilterSliderType.nearbyHomes) {
      this.currentValue = `${event.value}- ${event.highValue}`;
    }
  }

  public NearbyHomesChange(event): void {
    if (event.length > 0) {
      const split = event.split('-');
      this.sliderNearbyHomesOptions.value = split[0];
      this.sliderNearbyHomesOptions.highValue = split[1];
    }
  }

  public onaddPoint(): void {
    this.ftr.actionAddPoint$.next(null);
  }
}

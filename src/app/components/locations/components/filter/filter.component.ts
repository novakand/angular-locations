import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

// external libs
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { Utils } from '../../../../../app/services/utils';

// enums
import { FilterSliderType } from '../../enums/filter-slider-type.enums';
import { MoveTypeEnumstring } from '../../enums/move-type.enums';

// interfaces
import { ISliderOptions } from '../../interfaces/slider-optios.interface';

// services
import { LocationsService } from '../../services/locations.service';
@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterComponent implements OnInit, OnDestroy {

  public TransportType = MoveTypeEnumstring;
  public sortedWeekdays = [];
  public isChekedForecast: false;
  public filterForm: FormGroup;
  public upLoad = false;
  public value = 0;
  public highValue = 13875;
  public isFilterShow = false;
  public currentCO2KmValue = 0;
  public currentValue = null;
  public sliderType = FilterSliderType;
  public subscription: Subscription;
  public commutes: any = [];
  public forecastPoint: any = [];
  public dataSource: any;
  public changedCommuteOfficeDays: [] = [];
  public selectedTrasport: any;
  public selectedCommute: any = [];
  public changeTrasport = Object.values(MoveTypeEnumstring);
  public moveType: any = [];
  public copyMoveType: any = [];
  public isCopy = true;
  public isDisabledForecast = true;

  public sliderPerWeekOptions: ISliderOptions = {
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

  public sliderNearbyKmOptions: ISliderOptions = {
    floor: 0,
    value: 16,
    ceil: 16,
    disabled: true,
    minRange: 3,
    maxRange: 16,
    hideLimitLabels: true,
    hidePointerLabels: true,
    showSelectionBar: true,
    step: 1,
  };

  public sliderNearbyHomesOptions: ISliderOptions = {
    floor: 0,
    value: 0,
    ceil: 50,
    disabled: true,
    minRange: 1,
    maxRange: 50,
    highValue: 50,
    minLimit: 1,
    steps: 1,
    hideLimitLabels: true,
    showSelectionBar: true,
    hidePointerLabels: true,
  };

  public pending$ = new Subject<boolean>();
  private _destroy$ = new Subject<boolean>();

  constructor(
    private fb: FormBuilder,
    private _locService: LocationsService,
    private cdr: ChangeDetectorRef,
  ) { }

  public ngOnInit(): void {
    this.currentValue = `${this.sliderNearbyHomesOptions.value}-${this.sliderNearbyHomesOptions.highValue}`;
    this.buildForm();

    // this.filterForm.disable({ emitEvent: true, onlySelf: true });
    // this.sliderPerWeekOptions = { ...this.sliderPerWeekOptions, ...{ disabled: this.filterForm.disabled } };
    // this.isDisabledForecast = this.filterForm.disabled;

    this.isDisabledForecast = false;

    this.copyMoveType = this.changeTrasport;

    this.filterForm.valueChanges.pipe(
      filter((value) => !!value),
      debounceTime(1000),
      distinctUntilChanged(),
      takeUntil(this._destroy$),
    ).subscribe((value) => {
      this.sendFilter();
    });
    this._locService.actionCommutes$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      ).
      subscribe((data: any) => {
        this.commutes = data;
        this.isCopy = true;
        this.changeTrasport = Object.values(MoveTypeEnumstring);
        this.selectedCommute = Utils.deepCopy(this.commutes);
        this.sendFilter();
      });

    this._locService.mapDrag$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      ).
      subscribe((data: any) => {
        this.forecastPoint = data;
        this.sendFilter();
      });

    this._locService.changedCommute$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      ).
      subscribe((data: any) => {
        this.changedCommuteOfficeDays = data;
        this.sendFilter();
      });

    this._locService.filter$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      ).
      subscribe((data: any) => {
        this.isCopy = true;
        this.filterForm.patchValue(data.filter, { emitEvent: false });
        this.cdr.detectChanges();
        if (this.filterForm.get('isChekedTransport').value) {
          this.updateMoveType(data);
          this.isCopy && this.setCopyMoveType();
          this.setSelectedMoveType();
          this.enableMoveType();

          this.resetMoveType();
          this.setValueMoveType();
          this.setDisabledMoveType();
          this.cdr.detectChanges();
        }

        this.filterForm.get('isChekedNearbyHomes').patchValue(data.filter?.isChekedNearbyHomes, { emitEvent: true, onlySelf: true });
        this.sliderNearbyHomesOptions.highValue = data.filter?.nearbyHomesCountMax;
        this.sliderNearbyHomesOptions.value = data.filter?.nearbyHomesCountMin;
        this.sliderPerWeekOptions.value = data.filter?.cO2KgWeeklyMax;
        this.currentValue = `${this.sliderNearbyHomesOptions.value}-${this.sliderNearbyHomesOptions.highValue}`;
        this.filterForm.get('nearbyHomesCountMin').patchValue(this.currentValue, { emitEvent: true, onlySelf: true });
        this.cdr.detectChanges();
      });


    this.IsChekedTransportListener();
    this.changeNearbyKmListener();
    this.changeCO2KgWeeklyMax();
    this.isChekedNearbyHomesListener();

    this.filterForm.enable();
    this.filterForm.get('transports').disable({ emitEvent: false });
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public buildForm(): void {
    this.filterForm = this.fb.group({
      cO2KgWeeklyMax: new FormControl(this.sliderPerWeekOptions.value),
      nearbyKm: new FormControl({ value: this.sliderNearbyKmOptions.value, disabled: true }),
      nearbyHomesCountMin: new FormControl({ value: this.currentValue, disabled: true }),
      isChekedTransport: new FormControl(false),
      isChekedNearbyHomes: new FormControl(false),
      transports: this.fb.array(this.buildFieldsTransport()),
    });
  }

  public sendFilter(): void {
    this._locService.actionPreloader$.next(true);

    const defaultParam = {
      orgUid: '4a279442-93e3-4e76-8f87-1bc9da15f711',
      cO2KgWeeklyMin: 0,
      forecastPoints: this.forecastPoint || [],
      nearbyHomesCountMin: this.filterForm.get('isChekedNearbyHomes').value ? this.sliderNearbyHomesOptions.value : null,
      nearbyHomesCountMax: this.filterForm.get('isChekedNearbyHomes').value ? this.sliderNearbyHomesOptions.highValue : null,
      transports: this.filterForm.get('isChekedTransport').value ? this.changeTrasport : [],
      commuteQuartiles: this.commutes,
      isChekedForecast: this.isChekedForecast,
      changedCommuteOfficeDays: this.changedCommuteOfficeDays || [],
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
        this.dataSource = data;

        this._locService.actionPreloader$.next(false);

        if (!this.filterForm.get('isChekedTransport').value) { return; }
        this.updateMoveType(data);
        this.isCopy && this.setCopyMoveType();
        this.setSelectedMoveType();
        this.enableMoveType();

        this.resetMoveType();
        this.setValueMoveType();
        this.setDisabledMoveType();
        this.cdr.detectChanges();
      });
  }

  public isChekedNearbyHomesListener(): void {

    this.filterForm.get('isChekedNearbyHomes').valueChanges
      .pipe(
        takeUntil(this._destroy$),
      ).subscribe((value) => {
        value ?
          this.filterForm.get('nearbyKm').enable({ emitEvent: true, onlySelf: true })
          : this.filterForm.get('nearbyKm').disable({ emitEvent: true, onlySelf: true });
        value ?
          this.filterForm.get('nearbyHomesCountMin').enable({ emitEvent: true, onlySelf: true })
          : this.filterForm.get('nearbyHomesCountMin').disable({ emitEvent: true, onlySelf: true });

        this.sliderNearbyKmOptions = { ...this.sliderNearbyKmOptions, ...{ disabled: !value } };
        this.sliderNearbyHomesOptions = { ...this.sliderNearbyHomesOptions, ...{ disabled: !value } };
        this.cdr.detectChanges();
      });

  }

  public IsChekedTransportListener(): void {
    this.filterForm.get('isChekedTransport').valueChanges
      .pipe(
        takeUntil(this._destroy$),
      ).subscribe((value) => {
        this.filterForm.get('transports').disable({ emitEvent: true, onlySelf: true });
      });
  }

  public changeNearbyKmListener(): void {
    this.filterForm.get('nearbyKm').valueChanges
      .pipe(
        takeUntil(this._destroy$),
      ).subscribe((value) => {

        this.sliderNearbyKmOptions = { ...this.sliderNearbyKmOptions, ...{ value: value } };
      });
  }

  public changeCO2KgWeeklyMax(): void {

    this.filterForm.get('cO2KgWeeklyMax').valueChanges
      .pipe(
        takeUntil(this._destroy$),
      ).subscribe((value) => {

        this.sliderPerWeekOptions = { ...this.sliderPerWeekOptions, ...{ value: value } };
      });

  }

  public updateMoveType(data): void {
    const trasports =
      data?.commutes?.filter((v, i, a) => a.findIndex((t: { moveType: any; }) => (t.moveType === v.moveType)) === i);
    this.moveType = trasports.map((key) => key.moveType);
    this.cdr.detectChanges();
  }

  public setCopyMoveType(): void {
    this.copyMoveType = Utils.deepCopy(this.moveType);
    this.isCopy = false;
  }

  public setSelectedMoveType(): void {
    const checkboxControl: any = this.filterForm.get('transports');
    this.selectedTrasport = Object.values(this.TransportType).map((item: any) => {
      const moveType = Object.values(this.moveType).find((findItem) => findItem === item);
      return item = moveType ? moveType : false;
    });
  }

  public resetMoveType(): void {
    const checkboxControl: any = this.filterForm.get('transports');
    checkboxControl.setValue(checkboxControl.value.map((value: any, i: string | number) => true),
      { emitEvent: false },
    );
  }

  public enableMoveType(): void {
    const checkboxControl: any = this.filterForm.get('transports');
    checkboxControl.controls.map((items: any) => items.enable({ emitEvent: false }));
  }

  public setValueMoveType(): void {
    const checkboxControl: any = this.filterForm.get('transports');
    checkboxControl.setValue(
      checkboxControl.value.map((value: any, i: string | number) => this.selectedTrasport[i]),
      { emitEvent: false },
    );
  }

  public setDisabledMoveType(): void {
    const checkboxControl: any = this.filterForm.get('transports');
    checkboxControl.controls.map((items: any, i: string | number) => {
      items.enable({ emitEvent: false });
      const isNotDisabled = Object.values(this.copyMoveType).some((val) => val === Object.values(this.TransportType)[i]);
      isNotDisabled
        ? items.enable({ emitEvent: false }) : items.disable({ emitEvent: false });
    });
  }

  public getTransport(): any {
    return Object.values(this.selectedTrasport).filter((value) => !!value);
  }

  public onChangeForecast(event): void {
    this._locService.isChekedForecast$.next(event.currentTarget.checked);
    !event.currentTarget.checked && this._locService.isRemoveMarker$.next(true);
  }

  public buildFieldsTransport(): any {
    return Object.values(this.TransportType).map((x) => true);
  }

  public onChange(event: any, index: number) {

    if (!event.currentTarget.checked) {
      const f = 'notSet';
      this.changeTrasport = this.changeTrasport.filter((value) => value !== Object.values(this.TransportType)[index]);

      if (this.changeTrasport.length === 0) {
        this.commutes.push(f);
      }

    }

    if (this.changeTrasport.length === 0 && event.currentTarget.checked) {
      this.commutes = this.selectedCommute;
    }

    event.currentTarget.checked && this.changeTrasport.push(Object.values(this.TransportType)[index]);

  }

  public onForecat(event) {
    this._locService.isChekedForecast$.next(!event.currentTarget.checked);
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


  public toggleFilter(): void {
    this.isFilterShow = !this.isFilterShow;
  }

  public onSliderChange(event, filterType: FilterSliderType): void {
    this.currentValue = filterType === this.sliderType.nearbyHomesCountMin
      ? `${event.value}-${event.highValue}` : event.value;
    this.filterForm.get(filterType).setValue(this.currentValue);
    this.isCopy = true;
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


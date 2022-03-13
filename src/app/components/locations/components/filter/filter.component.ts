import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';

// external libs
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil, tap } from 'rxjs/operators';
import { Utils } from '../../../../../app/services/utils';
import { ChangeContext } from '@angular-slider/ngx-slider';

// enums
import { FilterSliderType } from '../../enums/filter-slider-type.enums';
import { MoveType } from '../../enums/move-type.enums';
import { CommuteQuartiles } from '../../enums/commute-quartiles.enum';

// interfaces
import { ISliderOptions } from '../../interfaces/slider-optios.interface';
import { ICommuteOfficeDay } from '../../interfaces/commute-office-day.interface';
import { IFilterResponse } from '../../interfaces/filter-response.interface';

// services
import { LocationsService } from '../../services/locations.service';
import { IFilterUploadResponse } from '../../interfaces/filter-upload-response.interface';
import { FilterService } from './filter.service';
import { IFilterRequest } from '../../interfaces/filter-request.interfaces';
@Component({
  selector: 'fatma-filter-form',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [FilterService],
})
export class FilterComponent implements OnInit, OnDestroy {

  public transportType = MoveType;
  public isChekedForecast: boolean;
  public filterForm: FormGroup;
  public isFilterShow: boolean;
  public currentValue: string | number;
  public sliderType = FilterSliderType;
  public isDisabledForecast = true;
  public isCopy = true;
  public moveType: any[] = [];
  public copyMoveType: MoveType[] = [];
  public trasportControl: FormArray;
  public selectedTrasport: any;

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
    minRange: 0,
    maxRange: 50,
    highValue: 50,
    minLimit: 0,
    steps: 1,
    hideLimitLabels: true,
    showSelectionBar: true,
    hidePointerLabels: true,
  };

  private _isAddFilter = true;
  private _commuteQuartiles: CommuteQuartiles[] = [];
  private _forecastPoints: any = [];
  private _changedCommuteOfficeDays: ICommuteOfficeDay = null;
  private _selectedCommute: CommuteQuartiles[] = [];
  private _changeTrasport = Object.values(MoveType);

  private _destroy$ = new Subject<boolean>();

  constructor(
    public cdr: ChangeDetectorRef,
    private _fb: FormBuilder,
    private _service: LocationsService,
    private _filterService: FilterService,
  ) {
    this._filterService.cmp = this;
  }

  public ngOnInit(): void {
    this._buildForm();
    this._enableFilterForm(false);

    this.copyMoveType = this._changeTrasport;

    this._watchForFormChanges();
    this._watchForCommuteChanges();

    this._watchForForeacstPointsChanges();
    this._watchForCommuteOfficeDaysChanges();
    this._watchForUploadChanges();

    this._watchForTrasportChanges();
    this._watchForNearbyKmChanges();
    this._watchForCO2KgWeeklyMaxChange();
    this._watchForNearbyHomesChanges();

    this._sendFilter();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public onForecastChange(isChecked: boolean): void {
    this._service.isChekedForecast$.next(isChecked);
    !isChecked && this._service.isRemoveMarker$.next(true);
  }

  public onTrasportChange(isChecked: boolean, index: number): void {

    if (!isChecked) {
      this.trasportSelected(index);
      if (this._changeTrasport.length === 0) {
        this._commuteQuartiles.push(CommuteQuartiles.notSet);
      }

    }

    if (this._changeTrasport.length === 0 && isChecked) {
      this._commuteQuartiles = this._selectedCommute;
    }

    isChecked && this._changeTrasport.push(Object.values(this.transportType)[index]);

  }

  public trasportSelected(index: number): MoveType[] {
    return this._changeTrasport = this._changeTrasport.filter((value) => value !== Object.values(this.transportType)[index]);
  }

  public onHomesChange(isChecked: boolean): void {
    isChecked ?
      this.filterForm.get('nearbyKm').enable({ emitEvent: true })
      : this.filterForm.get('nearbyKm').disable({ emitEvent: true });
    isChecked ?
      this.filterForm.get('nearbyHomesCountMin').enable({ emitEvent: true })
      : this.filterForm.get('nearbyHomesCountMin').disable({ emitEvent: true });

    this.sliderNearbyKmOptions = { ...this.sliderNearbyKmOptions, ...{ disabled: !isChecked } };
    this.sliderNearbyHomesOptions = { ...this.sliderNearbyHomesOptions, ...{ disabled: !isChecked } };
    this.cdr.detectChanges();
  }

  public onToggleFilter(): void {
    this.isFilterShow = !this.isFilterShow;
  }

  public onSliderChange(event: ChangeContext, filterType: FilterSliderType): void {
    this.currentValue = filterType === this.sliderType.nearbyHomesCountMin
      ? `${event.value}-${event.highValue}` : event.value;
    this.filterForm.get(filterType).setValue(this.currentValue);
    this.isCopy = true;
  }

  public onNearbyHomesChange(event: string): void {
    if (event.length > 0) {
      const split = event.split('-');
      this.sliderNearbyHomesOptions.value = Number(split[0]);
      this.sliderNearbyHomesOptions.highValue = Number(split[1]);
    }
  }

  public onAddPoint(): void {
    this._service.actionAddPoint$.next(true);
  }

  private _buildForm(): void {
    this.currentValue = `${this.sliderNearbyHomesOptions.value}-${this.sliderNearbyHomesOptions.highValue}`;
    this.filterForm = this._fb.group({
      cO2KgWeeklyMax: new FormControl(this.sliderPerWeekOptions.value),
      nearbyKm: new FormControl({ value: this.sliderNearbyKmOptions.value, disabled: true }),
      nearbyHomesCountMin: new FormControl({ value: this.currentValue, disabled: true }),
      isChekedTransport: new FormControl(false),
      isChekedNearbyHomes: new FormControl(false),
      transports: this._fb.array(this._buildFieldsTransport()),
    });

    this.trasportControl = <FormArray>this.filterForm.get('transports');
  }

  private _buildFieldsTransport(): boolean[] {
    return Object.values(this.transportType).map(() => true);
  }

  private _sendFilter(): void {
    this._service.actionPreloader$.next(true);

    const defaultParam: IFilterRequest = {
      orgUid: '4a279442-93e3-4e76-8f87-1bc9da15f711',
      officeName: '',
      cO2KgWeeklyMin: 0,
      cO2KgWeeklyMax: this.filterForm.get('cO2KgWeeklyMax').value,
      transports: this.filterForm.get('isChekedTransport').value ? this._changeTrasport : [],
      nearbyKm: this.filterForm.get('nearbyKm').value,
      nearbyHomesCountMin: this.filterForm.get('isChekedNearbyHomes').value ? this.sliderNearbyHomesOptions.value : null,
      nearbyHomesCountMax: this.filterForm.get('isChekedNearbyHomes').value ? this.sliderNearbyHomesOptions.highValue : null,
      forecastPoints: this._forecastPoints || [],
      commuteQuartiles: this._commuteQuartiles,
      changedCommuteOfficeDays: this._changedCommuteOfficeDays,
    };

    const filterParam = {
      ...this.filterForm.value,
      ...defaultParam,
    };

    this._service.takeFilter$.next(filterParam);

    this._service.filterUpdateAsync(defaultParam)
      .pipe(
        filter(Boolean),
        tap((data: IFilterResponse) => (this._isAddFilter && !!data?.allOffices?.length) && this._enableFilterForm(true)),
        tap((data: any) => this.filterForm.get('isChekedTransport').value && this._filterService.uploadFilterTrasport(data)),
        takeUntil(this._destroy$),
      )
      .subscribe((data: IFilterResponse) => {
        this._service.actionPreloader$.next(false);
        this._isAddFilter = false;
      });
  }

  private _watchForUploadChanges(): void {
    this._service.queryUpload$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      ).
      subscribe((data: IFilterUploadResponse) => {
        this._updateFieldsForm(data);
      });
  }

  private _watchForCommuteOfficeDaysChanges(): void {
    this._service.changedCommute$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      ).
      subscribe((data: any) => {
        this._changedCommuteOfficeDays = data;
        this._sendFilter();
      });
  }

  private _watchForForeacstPointsChanges(): void {
    this._service.mapDrag$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      ).
      subscribe((data: any) => {
        this._forecastPoints = data;
        this._sendFilter();
      });
  }

  private _watchForCommuteChanges(): void {
    this._service.actionCommutes$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      ).
      subscribe((data: any) => {
        this._commuteQuartiles = data;
        this.isCopy = true;
        this._changeTrasport = Object.values(MoveType);
        this._selectedCommute = Utils.deepCopy(this._commuteQuartiles);
        this._sendFilter();
      });
  }

  private _watchForFormChanges(): void {
    this.filterForm.valueChanges
      .pipe(
        filter((value) => !!value),
        debounceTime(900),
        distinctUntilChanged(),
        takeUntil(this._destroy$),
      ).subscribe(() => {
        this._sendFilter();
      });
  }

  private _watchForNearbyHomesChanges(): void {

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

  private _watchForTrasportChanges(): void {
    this.filterForm.get('isChekedTransport').valueChanges
      .pipe(
        takeUntil(this._destroy$),
      ).subscribe((value) => {
        this.filterForm.get('transports').disable({ emitEvent: true, onlySelf: true });
      });
  }

  private _watchForNearbyKmChanges(): void {
    this.filterForm.get('nearbyKm').valueChanges
      .pipe(
        takeUntil(this._destroy$),
      ).subscribe((value) => {

        this.sliderNearbyKmOptions = { ...this.sliderNearbyKmOptions, ...{ value: value } };
      });
  }

  private _watchForCO2KgWeeklyMaxChange(): void {
    this.filterForm.get('cO2KgWeeklyMax').valueChanges
      .pipe(
        takeUntil(this._destroy$),
      ).subscribe((value) => {

        this.sliderPerWeekOptions = { ...this.sliderPerWeekOptions, ...{ value: value } };
      });
  }

  private _updateFieldsForm(data: IFilterUploadResponse) {
    this.isCopy = true;
    this.filterForm.patchValue(data.filter, { emitEvent: false });
    this.filterForm.get('isChekedTransport').value && this._filterService.uploadFilterTrasport(data);
    this.filterForm.get('isChekedNearbyHomes').patchValue(data.filter?.isChekedNearbyHomes, { emitEvent: true, onlySelf: true });
    this.sliderNearbyHomesOptions.highValue = data.filter?.nearbyHomesCountMax;
    this.sliderNearbyHomesOptions.value = data.filter?.nearbyHomesCountMin;
    this.sliderPerWeekOptions.value = data.filter?.cO2KgWeeklyMax;
    this.currentValue = `${this.sliderNearbyHomesOptions.value}-${this.sliderNearbyHomesOptions.highValue}`;
    this.filterForm.get('nearbyHomesCountMin').patchValue(this.currentValue, { emitEvent: true, onlySelf: true });
    this.cdr.detectChanges();
  }

  private _enableFilterForm(isEnable: boolean): void {
    isEnable ? this.filterForm.enable({ emitEvent: false }) : this.filterForm.disable({ emitEvent: false, onlySelf: true });
    this.sliderPerWeekOptions = { ...this.sliderPerWeekOptions, ...{ disabled: this.filterForm.disabled } };
    this.isDisabledForecast = this.filterForm.disabled;
    this.filterForm.get('transports').disable({ emitEvent: false });
    this.filterForm.get('nearbyKm').disable({ emitEvent: false });
    this.filterForm.get('nearbyHomesCountMin').disable({ emitEvent: false });
    this.cdr.detectChanges();
  }
}

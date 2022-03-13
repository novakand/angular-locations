import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

// external lib
import { Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';

// services
import { LocationsService } from '../../../../components/locations/services/locations.service';

// interfaces
import { IFilterResponse } from 'src/app/components/locations/interfaces/filter-response.interface';

// enums
import { CommutesType } from '../../enums/commutest-type.enum';

@Component({
  selector: 'fatma-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss'],
})
export class LegendComponent implements OnInit, OnDestroy {

  public commutesType = CommutesType;
  public legendForm: FormGroup;
  public dataSource: IFilterResponse;
  public isShowLegend: boolean;

  private _destroy$ = new Subject<boolean>();

  constructor(
    private _fb: FormBuilder,
    private _service: LocationsService,
    private _cdr: ChangeDetectorRef,

  ) { }

  public ngOnInit(): void {
    this._buildForm();
    this._setValueForm();

    this._watchForFormChanges();
    this._watchForFilterUpdateChanges();
    this._watchForUploadChanges();
    this.legendForm.disable({ emitEvent: false, onlySelf: true });
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }


  public fieldsChange(): void {
    this.legendForm.get('all').reset();
  }

  public onAllChange(event): void {
    event.currentTarget.checked && this.legendForm.get('showCommutes').reset();
  }


  private _buildForm(): void {
    this.legendForm = this._fb.group({
      all: new FormControl({ checked: true }),
      showCommutes: this._fb.array(this._buildFieldArray()),
    });
  }

  private _buildFieldArray(): any {
    return Object.values(this.commutesType).map((x) => false);
  }

  private _setValueForm(): void {
    const checkboxControl = this.legendForm.get('showCommutes');
    checkboxControl.valueChanges.subscribe(() => {
      checkboxControl.setValue(
        checkboxControl.value.map((value, i) => value ? Object.values(this.commutesType)[i] : false),
        { emitEvent: false },
      );
    });
  }

  private _sendCommutes(val): void {
    const selectCommutes = this.legendForm.get('showCommutes').value.filter((value) => !!value);
    const selected = (!selectCommutes.length && !val.all) ? ['notSet'] : selectCommutes;
    this._service.actionCommutes$.next(selected);
  }

  private _watchForFormChanges(): void {
    this.legendForm.valueChanges
      .pipe(
        filter((value) => !!value),
        debounceTime(800),
        takeUntil(this._destroy$),
      ).subscribe((value) => this._sendCommutes(value));
  }

  private _watchForUploadChanges(): void {
    this._service.queryUpload$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      ).
      subscribe((data: any) => {
        this.legendForm.reset(true, { emitEvent: false, onlySelf: true });

        if (data.filter.commuteQuartiles.length === 0) {
          this.legendForm.get('all').setValue(true, { emitEvent: false, onlySelf: true });
          return;
        }
        const checkboxControl: any = this.legendForm.get('showCommutes');
        const selectedType = Object.values(this.commutesType).map((item: any) => {
          const moveType = Object.values(data.filter?.commuteQuartiles).find((findItem) => findItem === item);
          return item = moveType ? moveType : false;
        });

        checkboxControl.setValue(
          checkboxControl.value.map((value: any, i: string | number) => selectedType[i]),
          { emitEvent: false },
        );
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
        this.isShowLegend = !(!this.dataSource && !this.dataSource.commutes.length);
        !!this.dataSource.commutes.length && this.legendForm.enable({ emitEvent: false, onlySelf: true });
        this._cdr.detectChanges();
      });
  }
}

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { LocationsService } from '../../../../components/locations/services/locations.service';
import { CommutesType } from '../../enums/commutest-type.enum';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss'],
})
export class LegendComponent implements OnInit {

  public destroy$ = new Subject<boolean>();
  public commutesType = CommutesType;
  public legendForm: FormGroup;
  public dataSource: any;
  public isShowLegend: boolean;

  constructor(
    private fb: FormBuilder,
    private _locService: LocationsService,
    private cdr: ChangeDetectorRef,
  ) { }

  public ngOnInit(): void {
    this.buildForm();
    this.fieldListener();
    this.addListenersForm();
    this.addListenerFilter();
  }


  public addListenerFilter(): void {
    this._locService.takeFilter$
      .pipe(
        filter(Boolean),
        takeUntil(this.destroy$),
      ).
      subscribe((data: any) => {
        this.dataSource = data;
        this.isShowLegend = !(!this.dataSource && !this.dataSource.commutes.length);
        this.cdr.detectChanges();
      });

  }

  public buildForm(): void {
    this.legendForm = this.fb.group({
      all: new FormControl({ checked: true }),
      showCommutes: this.fb.array(this.buildFieldArray()),
    });
  }

  public addListenersForm(): void {
    this.legendForm.valueChanges.pipe(
      filter((value) => !!value),
      debounceTime(800),
      takeUntil(this.destroy$),
    ).subscribe((value) => this.sendCommutes(value));
  }

  public sendCommutes(val): void {
    const selectCommutes = this.legendForm.get('showCommutes').value.filter((value) => !!value);
    const selected = (!selectCommutes.length && !val.all) ? ['notSet'] : selectCommutes;
    this._locService.actionCommutes$.next(selected);
  }

  public fieldListener(): void {
    const checkboxControl = this.legendForm.get('showCommutes');
    checkboxControl.valueChanges.subscribe(() => {
      checkboxControl.setValue(
        checkboxControl.value.map((value, i) => value ? Object.values(this.commutesType)[i] : false),
        { emitEvent: false },
      );
    });
  }

  public buildFieldArray(): any {
    return Object.values(this.commutesType).map(x => false);
  }

  public fieldsChange(event): void {
    this.legendForm.get('all').reset();
  }

  public onAllChange(event): void {
    // tslint:disable-next-line: no-unused-expression
    event.currentTarget.checked && this.legendForm.get('showCommutes').reset();
  }
}

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

// interfaces
import { IFilterResponse } from '../../interfaces/filter-response.interface';

// services
import { LocationsService } from '../../services/locations.service';

@Component({
  selector: 'fatma-list-items',
  templateUrl: './list-items.component.html',
  styleUrls: ['./list-items.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListItemsComponent implements OnInit, OnDestroy {

  public allOffices$ = new BehaviorSubject<any>(null);

  private _destroy$ = new Subject<boolean>();

  constructor(
    private _cdr: ChangeDetectorRef,
    private _service: LocationsService,
  ) { }


  public ngOnInit(): void {
    this._createListItem();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  private _createListItem(): void {
    this._service.query$
      .pipe(
        filter(Boolean),
        tap((data: IFilterResponse) => data.allOffices?.forEach((item, index) => item.isSelected = index === 0)),
        takeUntil(this._destroy$),
      ).
      subscribe((data: IFilterResponse) => {
        this.allOffices$.next(data.allOffices);
      });
  }

}

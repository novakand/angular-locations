import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';
import { LocationsService } from '../../services/locations.service';

@Component({
  selector: 'app-list-items',
  templateUrl: './list-items.component.html',
  styleUrls: ['./list-items.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListItemsComponent implements OnInit, OnDestroy {

  public allOffices$ = new BehaviorSubject<any>(null);
  public destroy$ = new Subject<boolean>();

  constructor(
    private cdr: ChangeDetectorRef,
    private serv: LocationsService,
  ) { }


  public ngOnInit(): void {
    this.createListItem();
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  // tslint:disable-next-line: typedef
  public createListItem() {
    this.serv.takeFilter$
      .pipe(
        filter(Boolean),
        tap((items: any) => items.allOffices.forEach((item, index) => item.checked = index === 0)),
        takeUntil(this.destroy$),
      ).
      subscribe((data: any) => {
        this.allOffices$.next(data.allOffices);
      });
  }

  // tslint:disable-next-line: use-lifecycle-interface
  public onSelect(items: any): void {
    items.isOpen = items.isOpen ? false : true;
    this.cdr.detectChanges();
  }

}

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, SimpleChanges, ViewRef } from '@angular/core';
import { FilterResponce } from '../../interfaces/filter-responce.interfaces';

@Component({
  selector: 'app-list-items',
  templateUrl: './list-items.component.html',
  styleUrls: ['./list-items.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListItemsComponent implements OnInit {

  @Input() public dataFilterLocation: FilterResponce;
  public allOffices: any = [];

  constructor(
    private cdr: ChangeDetectorRef,
  ) { }

  public ngOnInit(): void { }

  // tslint:disable-next-line: use-lifecycle-interface
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.dataFilterLocation && changes.dataFilterLocation.currentValue) {
      this.allOffices = this.dataFilterLocation.allOffices;
    }
  }

  public onSelect(items: any): void {
    items.isOpen = items.isOpen ? false : true;
    this.cdr.detectChanges();
  }

}

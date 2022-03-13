import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { Utils } from '../../../../services/utils';
import { MoveType } from '../../enums/move-type.enums';
import { IFilterResponse } from '../../interfaces/filter-response.interface';
import { IFilterUploadResponse } from '../../interfaces/filter-upload-response.interface';

// components
import { FilterComponent } from './filter.component';


@Injectable()
export class FilterService {

  public cmp: FilterComponent;

  public uploadFilterTrasport(data: IFilterUploadResponse): void {
    this._updateMoveType(data);
    this.cmp.isCopy && this._setCopyMoveType();
    this._selectedMoveType();
    this._enableMoveType();

    this._resetMoveType();
    this._setValueMoveType();
    this._setDisabledMoveType();
    this.cmp.cdr.detectChanges();
  }

  private _updateMoveType(data: IFilterResponse): void {
    const trasports =
      data?.commutes?.filter((v, i, a) => a.findIndex((t: { moveType: any; }) => (t.moveType === v.moveType)) === i);
    this.cmp.moveType = trasports.map((key) => key.moveType);
    this.cmp.cdr.detectChanges();
  }

  private _setCopyMoveType(): void {
    this.cmp.copyMoveType = Utils.deepCopy(this.cmp.moveType);
    this.cmp.isCopy = false;
  }

  private _selectedMoveType(): void {
    this.cmp.selectedTrasport = Object.values(this.cmp.transportType).map((item: any) => {
      const moveType: MoveType = Object.values(this.cmp.moveType).find((findItem) => findItem === item);
      return item = moveType ? moveType : false;
    });
  }

  private _resetMoveType(): void {
    this.cmp.trasportControl.setValue(this.cmp.trasportControl.value.map(() => true),
      { emitEvent: false },
    );
  }

  private _enableMoveType(): void {
    this.cmp.trasportControl.controls.map((items: AbstractControl) => items.enable({ emitEvent: false }));
  }

  private _setValueMoveType(): void {
    this.cmp.trasportControl.setValue(
      this.cmp.trasportControl.value.map((value: AbstractControl, i: number) => this.cmp.selectedTrasport[i]),
      { emitEvent: false },
    );
  }

  private _setDisabledMoveType(): void {
    this.cmp.trasportControl.controls.map((items: AbstractControl, i: number) => {
      items.enable({ emitEvent: false });
      const isNotDisabled = Object.values(this.cmp.copyMoveType).some((val) => val === Object.values(this.cmp.transportType)[i]);
      isNotDisabled
        ? items.enable({ emitEvent: false }) : items.disable({ emitEvent: false });
    });
  }

}

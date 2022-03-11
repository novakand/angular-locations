import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

// external lib
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import moment from 'moment';

// services
import { LocationsService } from '../../services/locations.service';
import { UploadService } from '../../services/upload.service';
import { Utils } from '../../../../../app/services/utils';

// interfaces
import { IFilterUploadResponse } from '../../interfaces/filter-upload-response.interface';
import { IFilterResponse } from '../../interfaces/filter-response.interface';
import { IForecastPointsRes } from '../../interfaces/forecast-point.interfaces';

@Component({
  selector: 'fatma-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationsComponent implements OnInit, OnDestroy {

  @ViewChild('downloadLink', { static: true }) downloadLink: ElementRef;

  public isProgress = true;
  public isForecast = false;

  public isProgress$ = this._service.actionPreloader$;

  @ViewChild('file') public file: ElementRef<HTMLInputElement>;

  private _discardQuery: any = null;
  private _dataSource: IFilterResponse = null;
  private _forecastPoints: IForecastPointsRes[];

  private _destroy$ = new Subject<boolean>();

  constructor(
    private _service: LocationsService,
    private _uploadService: UploadService,
    private _cdr: ChangeDetectorRef,
  ) { }


  public ngOnInit(): void {
    this._watchForUploadFileChanges();
    this._watchForForecastPointChanges();
    this._watchForIsForecastChanges();
    this._watchForFilterUpdateChanges();
  }

  public ngOnDestroy(): void {
    this._destroy$.next(true);
    this._destroy$.complete();
  }

  public onDiscard(): void {
    this._service.query$.next(this._discardQuery);
    this._service.queryUpload$.next(this._discardQuery);
    this._service.isRemoveMarker$.next(true);
    this._cdr.detectChanges();
  }

  public onUploadFile(): void {
    this.file.nativeElement.click();
  }

  public onAddFile(event): void {
    this._uploadService.uploadFiles(event);
    this._service.actionPreloader$.next(true);
  }

  public onDownLoadFile(): void {
    this._dataSource.forecastPoints = this._forecastPoints;
    const uri = 'data:text/json;charset=UTF-8,' + encodeURIComponent(JSON.stringify(this._dataSource));
    this.downloadLink.nativeElement.href = uri || {};
    this.downloadLink.nativeElement.download = `fatma ${moment().format('DD MM YYYY HH:mm:ss')}.json`;
    this.downloadLink.nativeElement.click();
  }

  private _watchForFilterUpdateChanges(): void {
    this._service.query$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      )
      .subscribe((data: IFilterResponse) => {
        this._dataSource = data;
      });
  }

  private _watchForIsForecastChanges(): void {
    this._service.isChekedForecast$
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe((data: boolean) => {
        this.isForecast = data;
        data && this._copyQuery();
      });
  }

  private _copyQuery(): void {
    this._discardQuery = Utils.deepCopy(this._service.query$.getValue());
  }

  private _watchForForecastPointChanges(): void {
    this._service.addForecastPoint$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      )
      .subscribe((data: IForecastPointsRes[]) => {
        this._forecastPoints = data;
        this._cdr.detectChanges();
      });
  }

  private _watchForUploadFileChanges(): void {
    this._uploadService.uploadFile$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      )
      .subscribe((data: IFilterUploadResponse) => {
        this._service.query$.next(data);
        this._service.queryUpload$.next(data);
        this.file.nativeElement.value = '';
        this._service.actionPreloader$.next(false);
      });
  }
}

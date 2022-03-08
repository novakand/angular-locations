import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import moment from 'moment';

// services
import { LocationsService } from '../../services/locations.service';
import { UploadService } from '../../services/upload.service';
import { Utils } from '../../../../../app/services/utils';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationsComponent implements OnInit, OnDestroy {

  @ViewChild('downloadLink', { static: true }) downloadLink: ElementRef;

  public destroy$ = new Subject<boolean>();
  public isProgress = true;
  public upJson: any = {};
  public dataSource: any = {};
  public forecastPoints: any;
  public discardQuery: any = {};
  public isDiscardDisable = true;
  public isForecast = false;
  public isProgress$ = this._locService.actionPreloader$;

  @ViewChild('file') public file: ElementRef<HTMLInputElement>;

  private _destroy$ = new Subject<boolean>();

  constructor(
    private _locService: LocationsService,
    private _uploadService: UploadService,
    private _cdr: ChangeDetectorRef,
  ) { }


  public ngOnInit(): void {
    this._uploadService.uploadFile$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      )
      .subscribe((data: any) => {
        this.upJson = data;
        this._locService.takeFilter$.next(data);
        this._locService.filter$.next(data);
        this.file.nativeElement.value = '';
        this._locService.actionPreloader$.next(false);
      });

    this._locService.addForecastPoint$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      )
      .subscribe((data: any) => {
        console.log('data', data),
          this.forecastPoints = data;
        this._cdr.detectChanges();
      });

    this._locService.takeFilter$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      )
      .subscribe((data: any) => {
        this.dataSource = data;
      });

    this._locService.isChekedForecast$
      .pipe(
        takeUntil(this._destroy$),
      )
      .subscribe((data: any) => {
        this.isForecast = data;
        if (data) {
          this.discardQuery = Utils.deepCopy(this._locService.takeFilter$.getValue());
        }
      });

    this._locService.actionAddPoint$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      )
      .subscribe((data: any) => {
        this.isDiscardDisable = data;

      });
  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public onDiscard(): void {
    this._locService.takeFilter$.next(this.discardQuery);
    this._locService.filter$.next(this.discardQuery);
    this._locService.isRemoveMarker$.next(true);
    this._cdr.detectChanges();
  }

  public onUploadFile(): void {
    this.file.nativeElement.click();
  }

  public onAddFile(event): void {
    this._uploadService.uploadFiles(event);
    this._locService.actionPreloader$.next(true);
  }

  public onDownLoadFile(): void {
    const forecastPoints = Utils.deepCopy(this.dataSource.forecastPoints);
    this.dataSource.forecastPoints = this.forecastPoints;
    const uri = 'data:text/json;charset=UTF-8,' + encodeURIComponent(JSON.stringify(this.dataSource));
    this.downloadLink.nativeElement.href = uri || {};
    this.downloadLink.nativeElement.download = `fatma ${moment().format('DD MM YYYY HH:mm:ss')}.json`;
    this.downloadLink.nativeElement.click();
  }
}

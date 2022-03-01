import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import moment from 'moment';

// services
import { LocationsService } from '../../services/locations.service';
import { UploadService } from '../../services/upload.service';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
})
export class LocationsComponent implements OnInit, OnDestroy {

  @ViewChild('downloadLink', { static: true }) downloadLink: ElementRef;

  public destroy$ = new Subject<boolean>();
  public isProgress = true;
  public upJson: any = {};
  public dataSource: any = {};

  @ViewChild('file') public file: ElementRef<HTMLInputElement>;

  private _destroy$ = new Subject<boolean>();

  constructor(
    private _locService: LocationsService,
    private _uploadService: UploadService,
  ) { }


  public ngOnInit(): void {
    this.addListenerPreloader();

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
        this.dataSource.forecastPoints = data;
      });

    this._locService.takeFilter$
      .pipe(
        filter(Boolean),
        takeUntil(this._destroy$),
      )
      .subscribe((data: any) => {
        this.dataSource = data;
      });


  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public addListenerPreloader(): void {

    this._locService.actionPreloader$
      .pipe(
        takeUntil(this.destroy$),
      ).
      subscribe((data: boolean) => {
        this.isProgress = data;
      });
  }

  public onUploadFile(): void {
    this.file.nativeElement.click();
  }

  public onAddFile(event): void {
    this._uploadService.uploadFiles(event);
    this._locService.actionPreloader$.next(true);
  }

  public onDownLoadFile(): void {
    const uri = 'data:text/json;charset=UTF-8,' + encodeURIComponent(JSON.stringify(this.dataSource));
    this.downloadLink.nativeElement.href = uri || {};
    this.downloadLink.nativeElement.download = `fatma ${moment().format('DD MM YYYY HH:mm:ss')}.json`;
    this.downloadLink.nativeElement.click();
  }
}

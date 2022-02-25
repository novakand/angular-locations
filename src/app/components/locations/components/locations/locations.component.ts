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

  private _destroy$ = new Subject<boolean>();

  @ViewChild('file') public file: ElementRef<HTMLInputElement>;

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
  }

  public onDownLoadFile(): void {
    const uri = "data:text/json;charset=UTF-8," + encodeURIComponent(JSON.stringify(this.upJson));
    this.downloadLink.nativeElement.href = uri || {};
    this.downloadLink.nativeElement.download = `fatma ${moment().format('DD MM YYYY hh:mm:ss')}.json`;
    this.downloadLink.nativeElement.click();
  }
}

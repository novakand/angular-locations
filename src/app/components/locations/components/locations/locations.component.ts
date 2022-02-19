
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import html2canvas from 'html2canvas';
import { from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SaveImageComponent } from 'src/app/components/save-image/components/save-image/save-image.component';

// services
import { LocationsService } from '../../services/locations.service';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
})
export class LocationsComponent implements OnInit, OnDestroy {

  @ViewChild('screen', { static: true }) screenContainer: ElementRef;
  @ViewChild('saveImage', { static: true }) saveImage: SaveImageComponent;


  constructor(
    private locService: LocationsService,
  ) { }


  public destroy$ = new Subject<boolean>();
  public isProgress = true;

  public ngOnInit(): void {
    this.addListenerPreloader();

  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public onSavePng(): void {
    this.saveImage.saveScreen();
  }


  public addListenerPreloader(): void {

    this.locService.actionPreloader$
      .pipe(
        takeUntil(this.destroy$),
      ).
      subscribe((data: any) => {
        this.isProgress = data;
      });
  }
}

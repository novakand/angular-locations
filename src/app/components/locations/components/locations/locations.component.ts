
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ScreensHotComponent } from '.././../../screenshot/screenshot.component';

// services
import { LocationsService } from '../../services/locations.service';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
})
export class LocationsComponent implements OnInit, OnDestroy {

  @ViewChild('screen', { static: true }) screenContainer: ElementRef;

  @ViewChild('screensHot', { static: true }) screensHot: ScreensHotComponent;

  public destroy$ = new Subject<boolean>();
  public isProgress = true;


  constructor(
    private locService: LocationsService,
  ) { }


  public ngOnInit(): void {
    this.addListenerPreloader();

  }

  public ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  public onSavePng(): void {
    this.screensHot.saveScreen();
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

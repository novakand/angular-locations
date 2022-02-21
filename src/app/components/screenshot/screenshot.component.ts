import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import html2canvas from 'html2canvas';
import { from } from 'rxjs';
import moment from 'moment';


@Component({
  selector: 'app-screenshot',
  templateUrl: './screenshot.component.html',
  styleUrls: ['./screenshot.component.scss'],
})
export class ScreensHotComponent implements OnInit {

  @ViewChild('downloadLink', { static: true }) downloadLink: ElementRef;

  @Input() public screenContainer: ElementRef;


  constructor() { }


  public ngOnInit(): void { }

  public saveScreen(): void {
    this.downloadImage();
  }

  public async downloadImage(): Promise<void> {
    const capture$ = from(
      html2canvas(this.screenContainer.nativeElement, { useCORS: true, logging: false }).then((canvas) => {
        return canvas.toDataURL('image/png');
      }));
    const image = await capture$.toPromise();
    this.downloadLink.nativeElement.href = image;
    this.downloadLink.nativeElement.download = `fatma ${moment().format('DD MM YYYY hh:mm:ss')}`;
    this.downloadLink.nativeElement.click();
  }
}

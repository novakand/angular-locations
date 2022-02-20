import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import html2canvas from 'html2canvas';
import { from } from 'rxjs';


@Component({
  selector: 'app-screenshot',
  templateUrl: './screenshot.component.html',
  styleUrls: ['./screenshot.component.scss'],
})
export class ScreensHotComponent implements OnInit {

  @ViewChild('canvas', { static: true }) canvas: ElementRef;
  @ViewChild('downloadLink', { static: true }) downloadLink: ElementRef;

  @Input() public screenContainer: ElementRef;


  constructor() { }


  public ngOnInit(): void { }

  public saveScreen(): void {
    this.downloadImage();
  }

  public async downloadImage(): Promise<void> {

    const capture$ = from(
      html2canvas(this.screenContainer.nativeElement, { useCORS: true, allowTaint: true }).then((canv) => {
        return canv.toDataURL('image/png');
      }));
    const image = await capture$.toPromise();
    this.downloadLink.nativeElement.href = image;
    this.canvas.nativeElement.src = image;
    this.downloadLink.nativeElement.download = 'fatma-app.png';
    this.downloadLink.nativeElement.click();
  }
}

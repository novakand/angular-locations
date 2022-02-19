import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import html2canvas from 'html2canvas';
import { from } from 'rxjs';


@Component({
  selector: 'app-save-image',
  templateUrl: './save-image.component.html',
  styleUrls: ['./save-image.component.scss']
})
export class SaveImageComponent implements OnInit {

  constructor() { }

  @ViewChild('canvas', { static: true }) canvas: ElementRef;
  @ViewChild('downloadLink', { static: true }) downloadLink: ElementRef;

  @Input() public screenContainer: ElementRef;


  public ngOnInit(): void { }

  public saveScreen(): void {
    this.downloadImage();
  }

  public async downloadImage(): Promise<void> {

    const capture$ = from(
      html2canvas(this.screenContainer.nativeElement, { useCORS: true, allowTaint : true }).then(canv => {
        return canv.toDataURL('image/png');
      }));
    const image = await capture$.toPromise();
    this.downloadLink.nativeElement.href = image;
    this.canvas.nativeElement.src = image;
    this.downloadLink.nativeElement.download = 'fatma-app.png';
    this.downloadLink.nativeElement.click();
  }
}

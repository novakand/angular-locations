import {
    AfterContentInit, AfterViewInit,
    Component, ContentChild, ContentChildren, ElementRef, Input, OnInit, Renderer2, ViewChild, ViewContainerRef
} from '@angular/core';
import { GoogleMap } from '@angular/google-maps';

@Component({
    selector: 'app-map-info-box',
    templateUrl: './map-info-box.component.html',
    styleUrls: ['./map-info-box.component.scss']
})
export class MapInfoBoxComponent implements OnInit {

    @Input() public data: any;
    @ViewChild('content') private content: ElementRef<HTMLElement>;
    @ContentChildren('content2') private content2: ElementRef<HTMLElement>;

    private isOpen: boolean;
    private addService: boolean;
    private container: HTMLElement;
    private clientX: number;
    private clientY: number;
    private width: number;
    private height: number;
    private overlayMap: google.maps.OverlayView;

    constructor(
        private readonly elementRef: ElementRef,
        private renderer: Renderer2,


    ) { }

    public ngOnInit(): void {
        this.overlayMap = new google.maps.OverlayView();
        this.overlayMap.setMap(this.data.googleMap);
        this.container = this.elementRef.nativeElement.parentElement.childNodes[0];
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.addService = true;
    }

    public open(e?: any): void {

        const px = this.overlayMap.getProjection().fromLatLngToContainerPixel(e.latLng);
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.clientX = px.x;
        this.clientY = px.y;
        // tslint:disable-next-line: no-unused-expression
        this.container && this.container.appendChild(this.content.nativeElement);
        // tslint:disable-next-line: no-unused-expression
        this.content.nativeElement && this._setPosition();
        this.isOpen = true;
    }

    public close(): void {
        // tslint:disable-next-line: no-unused-expression
        (this.content && this.isOpen) && this.container.removeChild(this.content.nativeElement);
        this.isOpen = false;
    }

    private _setPosition(): void {
        this.renderer.setAttribute(this.content.nativeElement, 'class',
            `${this._getInfoBoxPositionClass()[0]} ${this._getInfoBoxPositionClass()[1]}`);
        this.renderer.setStyle(this.content.nativeElement, 'top', `${this.clientY + this._getInfoBoxYOffset()}px`);
        this.renderer.setStyle(this.content.nativeElement, 'left', `${this.clientX + this._getInfoBoxXOffset()}px`);
        this.renderer.setStyle(this.content.nativeElement, 'position', 'absolute');
    }

    private _getInfoBoxXOffset(): number {
        const offsetX = 340;
        const yCenter = this._getInfoBoxYOffset() === -20;
        return !yCenter ? 0 : this.clientX < offsetX
            ? 22 : -22;
    }

    private _getInfoBoxYOffset(): number {
        const offsetY = 40;
        return this.clientY < offsetY && (this.clientY > (this.height - offsetY))
            ? -20 : this.clientY < offsetY ? 12 : -42;
    }

    private _getInfoBoxPositionClass(): string[] {
        const offsetX = 170;
        const offsetY = 100;
        const classes = [];
        let yCenter = false;

        if (this.clientY < offsetY && (this.clientY > (this.height - offsetY))) {
            classes.push('__y-center');
            yCenter = true;
        } else if (this.clientY < offsetY) {
            classes.push('__y-bottom');
        } else {
            classes.push('__y-top');
        }

        if (yCenter) {
            if (this.clientX < (offsetX * 2)) {
                classes.push('__x-right');
            } else {
                classes.push('__x-left');
            }
        } else {
            if ((this.clientX > offsetX) && (this.clientX < (this.width - offsetX))) {
                classes.push('__x-center');
            } else if (this.clientX < offsetX) {
                classes.push('__x-right');
            } else if (this.clientX > (this.width - offsetX)) {
                classes.push('__x-left');
            }
        }
        return classes;
    }



}

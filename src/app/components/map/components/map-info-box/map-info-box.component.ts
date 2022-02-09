import { Component, ElementRef, OnInit, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
    selector: 'app-map-info-box',
    templateUrl: './map-info-box.component.html',
    styleUrls: ['./map-info-box.component.scss']
})
export class MapInfoBoxComponent implements OnInit {

    constructor(
        private readonly elementRef: ElementRef,
        private renderer: Renderer2,


    ) { }
    private container: HTMLElement;

    public ngOnInit(): void { }

}

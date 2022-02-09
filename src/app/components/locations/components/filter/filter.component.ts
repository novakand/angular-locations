import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {

  public value = 123;
  options: any = {
    floor: 0,
    ceil: 250
  };

  constructor() { }

  ngOnInit(): void {
  }

}

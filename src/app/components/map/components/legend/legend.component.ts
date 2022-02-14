import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss']
})
export class LegendComponent implements OnInit {


  public isCheckedColorAll = true;
  public IsCheckedColor = false;

  constructor() { }

  public ngOnInit(): void {
  }

  public fieldsChange(event) { }

}

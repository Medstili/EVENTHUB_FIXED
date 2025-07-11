import { Component, Input } from '@angular/core';
// import { MatCardTitle } from '@angular/material/card';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';
// import { LegendPosition } from '@swimlane/ngx-charts';
@Component({
  selector: 'app-pie-chart',
  imports: [
    NgxChartsModule,
    // MatCardTitle
  ],
  templateUrl: './pie-chart.component.html',
  styleUrl: './pie-chart.component.scss'
})
export class PieChartComponent {
@Input() pieView: [number, number] = [600, 400];
@Input() data!: [name: string, value: number][] ;

orangeScheme: Color = {
  name: 'orangeGradient',
  selectable: true,
  group: ScaleType.Ordinal,
  domain: [
    '#FFCC80',
    '#FB8C00',
  ]
};

}

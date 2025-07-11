import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';


@Component({
  selector: 'app-revenue-chart-component', 
  imports: [
    CommonModule,
    NgxChartsModule,

  ],
  templateUrl: './revenue-chart-component.component.html',
  styleUrl: './revenue-chart-component.component.scss'
})


export class RevenueChartComponentComponent  {

  @Input() dataSource: { name: string; series: { name: string; value: number }[] }[] = [];
  @Input() revenueData:{month: number, revenue: number}[] = [];
  @Input() chartView:[number, number] = [600, 350];

  orangeScheme: Color = {
    name: 'orangeGradient',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [
      '#ffa726', 
      '#fb8c00',
      '#f57c00',
    ]
  };

}

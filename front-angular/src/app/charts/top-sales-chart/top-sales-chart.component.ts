import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-top-sales-chart',
  standalone: true,
  imports: [
    NgxChartsModule,
    MatCardModule,
  ],  
  templateUrl: './top-sales-chart.component.html',
  styleUrls: ['./top-sales-chart.component.scss']
})

export class TopSalesChartComponent {
  @Input() dataSource: { name: string; value: number }[] = [];
  @Input() chartView: [number, number] = [600, 400];
  orangeScheme: Color = {
    name: 'orangeGradient',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [
      '#FFE0B2', // light
      '#FFCC80',
      '#FFB74D',
      '#FFA726',
      '#FF9800', // base
      '#FB8C00',
      '#F57C00',
      '#EF6C00',
      '#E65100', // dark
    ]
  };

}

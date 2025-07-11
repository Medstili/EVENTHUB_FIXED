import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-user-growth-chart',
  imports: [
    CommonModule,
    NgxChartsModule,
  ],
  templateUrl: './user-growth-chart.component.html',
  styleUrl: './user-growth-chart.component.scss'
})
export class UserGrowthChartComponent {
  @Input() dataSource: { name: string; value: number }[] = [];
  @Input() chartView: [number, number] = [600, 350];

  // Chart options

  @Input() xAxisLabel = 'Month';
  @Input() yAxisLabel = 'New Users';


  colorScheme: Color = {
    name: 'userGrowth',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [
      '#2196F3',
      '#4CAF50',
      '#FF9800',
      '#9C27B0',
      '#F44336'
    ]
  };

} 
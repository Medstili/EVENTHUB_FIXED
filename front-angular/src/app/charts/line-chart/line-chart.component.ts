import { Component, Input, input } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';



@Component({
  selector: 'app-line-chart',
  imports: [
    NgxChartsModule,
  ],
  templateUrl: './line-chart.component.html',
  styleUrl: './line-chart.component.scss'
})
export class LineChartComponent {
  @Input() data: any[] = [];
  @Input() chartView: [number, number] = [600, 400];

  // options

 @Input() xAxisLabel: string = 'Month';
 @Input() yAxisLabel: string = 'tickets Sold';


  onSelect(data: any): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  onActivate(data: any): void {
    console.log('Activate', JSON.parse(JSON.stringify(data)));
  }

  onDeactivate(data: any): void {
    console.log('Deactivate', JSON.parse(JSON.stringify(data)));
  }
}

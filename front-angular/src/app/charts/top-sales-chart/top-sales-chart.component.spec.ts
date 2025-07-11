import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopSalesChartComponent } from './top-sales-chart.component';

describe('TopSalesChartComponent', () => {
  let component: TopSalesChartComponent;
  let fixture: ComponentFixture<TopSalesChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopSalesChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopSalesChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

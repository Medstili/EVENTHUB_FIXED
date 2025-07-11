import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevenueChartComponentComponent } from './revenue-chart-component.component';

describe('RevenueChartComponentComponent', () => {
  let component: RevenueChartComponentComponent;
  let fixture: ComponentFixture<RevenueChartComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevenueChartComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevenueChartComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

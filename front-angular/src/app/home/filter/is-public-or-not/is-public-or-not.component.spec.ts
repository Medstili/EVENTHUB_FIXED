import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IsPublicOrNotComponent } from './is-public-or-not.component';

describe('IsPublicOrNotComponent', () => {
  let component: IsPublicOrNotComponent;
  let fixture: ComponentFixture<IsPublicOrNotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IsPublicOrNotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IsPublicOrNotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

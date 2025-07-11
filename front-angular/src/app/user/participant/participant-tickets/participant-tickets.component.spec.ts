import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantReservationsComponent } from './participant-tickets.component';

describe('ParticipantReservationsComponent', () => {
  let component: ParticipantReservationsComponent;
  let fixture: ComponentFixture<ParticipantReservationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParticipantReservationsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParticipantReservationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

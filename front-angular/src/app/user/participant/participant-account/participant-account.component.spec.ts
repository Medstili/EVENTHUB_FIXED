import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantAccountComponent } from './participant-account.component';

describe('ParticipantAccountComponent', () => {
  let component: ParticipantAccountComponent;
  let fixture: ComponentFixture<ParticipantAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParticipantAccountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParticipantAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

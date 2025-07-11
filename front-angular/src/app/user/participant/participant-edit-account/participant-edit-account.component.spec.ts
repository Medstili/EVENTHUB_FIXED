import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantEditAccountComponent } from './participant-edit-account.component';

describe('ParticipantEditAccountComponent', () => {
  let component: ParticipantEditAccountComponent;
  let fixture: ComponentFixture<ParticipantEditAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParticipantEditAccountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParticipantEditAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { ReservationsService } from './tickets.service';

describe('ReservationsService', () => {
  let service: ReservationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReservationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { OrganizerServer } from './organizer.service';

describe('OrganizerService', () => {
  let service: OrganizerServer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrganizerServer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

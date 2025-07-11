import { TestBed } from '@angular/core/testing';

import { StripeService } from './stripe-api.service';

describe('StripeService', () => {
  let service: StripeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StripeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

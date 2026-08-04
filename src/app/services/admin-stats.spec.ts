import { TestBed } from '@angular/core/testing';

import { AdminStats } from './admin-stats';

describe('AdminStats', () => {
  let service: AdminStats;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminStats);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

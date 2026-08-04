import { TestBed } from '@angular/core/testing';

import { Objectif } from './objectif';

describe('Objectif', () => {
  let service: Objectif;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Objectif);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

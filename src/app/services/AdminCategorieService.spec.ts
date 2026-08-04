import { TestBed } from '@angular/core/testing';

import { AdminCategorieService } from './admin-categorie';

describe('AdminCategorie', () => {
  let service: AdminCategorieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminCategorieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

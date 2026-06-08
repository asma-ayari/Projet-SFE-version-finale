import { TestBed } from '@angular/core/testing';

import { Qcm } from './qcm';

describe('Qcm', () => {
  let service: Qcm;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Qcm);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

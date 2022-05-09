import { TestBed } from '@angular/core/testing';

import { AkaReporterService } from './aka-reporter.service';

describe('AkaReporterService', () => {
  let service: AkaReporterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AkaReporterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

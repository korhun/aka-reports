import { TestBed } from '@angular/core/testing';

import { HandbrakeService } from './handbrake.service';

describe('HandbrakeService', () => {
  let service: HandbrakeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HandbrakeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ScanSessionsService } from './scan-sessions.service';

describe('Service: ScanSessions', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScanSessionsService]
    });
  });

  it('should ...', inject([ScanSessionsService], (service: ScanSessionsService) => {
    expect(service).toBeTruthy();
  }));
});

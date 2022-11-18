import { TestBed } from '@angular/core/testing';

import { NavGuard } from './nav.guard';

describe('NavGuard', () => {
  let guard: NavGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(NavGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});

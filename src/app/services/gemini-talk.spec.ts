import { TestBed } from '@angular/core/testing';

import { GeminiTalk } from './gemini-talk';

describe('GeminiTalk', () => {
  let service: GeminiTalk;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeminiTalk);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Talk } from './talk';

describe('Talk', () => {
  let component: Talk;
  let fixture: ComponentFixture<Talk>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Talk]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Talk);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

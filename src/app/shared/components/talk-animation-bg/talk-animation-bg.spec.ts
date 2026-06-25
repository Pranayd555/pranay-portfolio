import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TalkAnimationBg } from './talk-animation-bg';

describe('TalkAnimationBg', () => {
  let component: TalkAnimationBg;
  let fixture: ComponentFixture<TalkAnimationBg>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TalkAnimationBg]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TalkAnimationBg);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

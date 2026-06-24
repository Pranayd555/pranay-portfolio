import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiModal } from './ai-modal';

describe('AiModal', () => {
  let component: AiModal;
  let fixture: ComponentFixture<AiModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AiModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AiModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

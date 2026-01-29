import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjDesModal } from './proj-des-modal';

describe('ProjDesModal', () => {
  let component: ProjDesModal;
  let fixture: ComponentFixture<ProjDesModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjDesModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjDesModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

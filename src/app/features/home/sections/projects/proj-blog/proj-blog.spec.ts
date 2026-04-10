import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjBlog } from './proj-blog';

describe('ProjBlog', () => {
  let component: ProjBlog;
  let fixture: ComponentFixture<ProjBlog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjBlog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjBlog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

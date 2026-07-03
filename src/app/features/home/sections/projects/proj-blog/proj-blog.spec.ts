import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjBlog } from './proj-blog';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { GeminiAi } from '../../../../../services/gemini-ai';
import { describe, it, expect, beforeEach } from 'vitest';

describe('ProjBlog', () => {
  let component: ProjBlog;
  let fixture: ComponentFixture<ProjBlog>;

  const mockActivatedRoute = {
    params: of({ project: 'codelens-graph' })
  };

  const mockGeminiAi = {
    showChat: new Subject<boolean>()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjBlog],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: GeminiAi, useValue: mockGeminiAi },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
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

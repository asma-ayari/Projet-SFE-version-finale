import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursEdit } from './cours-edit';

describe('CoursEdit', () => {
  let component: CoursEdit;
  let fixture: ComponentFixture<CoursEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoursEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

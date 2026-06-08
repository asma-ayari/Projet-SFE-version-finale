import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursDetail } from './cours-detail';

describe('CoursDetail', () => {
  let component: CoursDetail;
  let fixture: ComponentFixture<CoursDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoursDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

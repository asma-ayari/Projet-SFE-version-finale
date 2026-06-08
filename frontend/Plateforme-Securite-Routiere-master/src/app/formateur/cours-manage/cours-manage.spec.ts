import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursManage } from './cours-manage';

describe('CoursManage', () => {
  let component: CoursManage;
  let fixture: ComponentFixture<CoursManage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursManage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoursManage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QcmList } from './qcm-list';

describe('QcmList', () => {
  let component: QcmList;
  let fixture: ComponentFixture<QcmList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QcmList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QcmList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

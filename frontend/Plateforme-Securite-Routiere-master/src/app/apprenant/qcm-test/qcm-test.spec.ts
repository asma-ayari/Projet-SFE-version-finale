import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QcmTest } from './qcm-test';

describe('QcmTest', () => {
  let component: QcmTest;
  let fixture: ComponentFixture<QcmTest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QcmTest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QcmTest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

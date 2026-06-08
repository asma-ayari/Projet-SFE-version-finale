import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QcmManagement } from './qcm-management';

describe('QcmManagement', () => {
  let component: QcmManagement;
  let fixture: ComponentFixture<QcmManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QcmManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QcmManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

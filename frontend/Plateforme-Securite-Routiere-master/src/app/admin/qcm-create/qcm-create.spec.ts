import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QcmCreate } from './qcm-create';

describe('QcmCreate', () => {
  let component: QcmCreate;
  let fixture: ComponentFixture<QcmCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QcmCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QcmCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

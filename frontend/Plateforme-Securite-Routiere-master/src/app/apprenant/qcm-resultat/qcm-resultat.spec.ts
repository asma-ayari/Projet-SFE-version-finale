import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QcmResultat } from './qcm-resultat';

describe('QcmResultat', () => {
  let component: QcmResultat;
  let fixture: ComponentFixture<QcmResultat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QcmResultat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QcmResultat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

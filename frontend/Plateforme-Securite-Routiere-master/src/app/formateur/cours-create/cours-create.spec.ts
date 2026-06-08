import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursCreate } from './cours-create';

describe('CoursCreate', () => {
  let component: CoursCreate;
  let fixture: ComponentFixture<CoursCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoursCreate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatbotTraining } from './chatbot-training';

describe('ChatbotTraining', () => {
  let component: ChatbotTraining;
  let fixture: ComponentFixture<ChatbotTraining>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatbotTraining]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatbotTraining);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

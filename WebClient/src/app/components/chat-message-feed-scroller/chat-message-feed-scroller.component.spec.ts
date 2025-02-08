import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatMessageFeedScrollerComponent } from './chat-message-feed-scroller.component';

describe('ChatMessageFeedScrollerComponent', () => {
  let component: ChatMessageFeedScrollerComponent;
  let fixture: ComponentFixture<ChatMessageFeedScrollerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatMessageFeedScrollerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatMessageFeedScrollerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

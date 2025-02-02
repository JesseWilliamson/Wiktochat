import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatMessageFeedComponent } from './chat-message-feed.component';

describe('MessageFeedComponent', () => {
  let component: ChatMessageFeedComponent;
  let fixture: ComponentFixture<ChatMessageFeedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatMessageFeedComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatMessageFeedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

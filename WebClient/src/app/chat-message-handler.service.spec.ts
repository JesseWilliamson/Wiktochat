import { TestBed } from '@angular/core/testing';

import { ChatMessageHandlerService } from './chat-message-handler.service';

describe('ChatMessageHandlerService', () => {
  let service: ChatMessageHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChatMessageHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { Component, HostListener, ViewChild, ElementRef, computed, effect, inject } from '@angular/core';
import { ChatMessageComponent } from '@app/components/chat-message/chat-message.component';
import { CommonModule } from '@angular/common';
import { ChatMessageHandlerService } from '@app/services/chat-message-handler.service';
import { ReadonlyCanvasComponent } from '../readonly-canvas/readonly-canvas.component';
import { GridMessage } from '@app/components/models/types';

@Component({
  selector: 'app-chat-message-feed-scroller',
  standalone: true,
  imports: [ChatMessageComponent, CommonModule, ReadonlyCanvasComponent],
  templateUrl: './chat-message-feed-scroller.component.html',
  styleUrl: './chat-message-feed-scroller.component.less',
})
export class ChatMessageFeedScrollerComponent {
  @ViewChild('thumbnailsContainer') thumbnailsContainer!: ElementRef;

  private chatService = inject(ChatMessageHandlerService);
  
  // Get messages in reverse chronological order (newest first)
  messages = computed<GridMessage[]>(() => {
    const messages = [...this.chatService.chatMessages()];
    return messages.sort((a, b) =>
      new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime()
    );
  });

  highlightedMessageId: string | null = null;
  private lastMessageId: string | null = null;
  private currentIndex = 0;
  private readonly SCROLL_PADDING = 20; // Padding to maintain at top/bottom

  constructor() {
    // Watch for new messages and highlight the most recent one
    effect(() => {
      const messages = this.messages();
      if (messages.length > 0) {
        const newestMessage = messages[0]; // First item is newest due to sorting
        
        // Only update if we have a new message
        if (newestMessage.id !== this.lastMessageId) {
          this.highlightedMessageId = newestMessage.id;
          this.lastMessageId = newestMessage.id;
          this.currentIndex = 0; // Reset scroll position to newest
          
          // Scroll to show the highlighted message
          setTimeout(() => this.scrollToHighlighted(), 0);
        }
      }
    });
  }

  @HostListener('wheel', ['$event'])
  onScroll(event: WheelEvent) {
    event.preventDefault();

    const messages = this.messages();
    if (!messages.length) return;

    // For column-reverse, positive deltaY (scroll down) should decrease the index
    if (event.deltaY > 0) {
      // Scrolling down - move highlight up (decrease index)
      this.currentIndex = Math.max(this.currentIndex - 1, 0);
    } else {
      // Scrolling up - move highlight down (increase index)
      this.currentIndex = Math.min(this.currentIndex + 1, messages.length - 1);
    }

    this.highlightedMessageId = messages[this.currentIndex]?.id || null;
    this.scrollToHighlighted();
  }

  private scrollToHighlighted() {
    if (!this.thumbnailsContainer?.nativeElement) return;
    
    const container = this.thumbnailsContainer.nativeElement;
    const thumbnails = container.children;
    if (!thumbnails.length) return;

    // Find the index of the highlighted message in the DOM
    let targetIndex = 0;
    for (let i = 0; i < thumbnails.length; i++) {
      if (thumbnails[i].getAttribute('data-message-id') === this.highlightedMessageId) {
        targetIndex = i;
        break;
      }
    }

    const highlightedThumbnail = thumbnails[targetIndex];
    if (!highlightedThumbnail) return;

    const containerRect = container.getBoundingClientRect();
    const thumbnailRect = highlightedThumbnail.getBoundingClientRect();

    // In column-reverse, the "top" is actually the bottom of the visual layout
    if (thumbnailRect.bottom > containerRect.bottom - this.SCROLL_PADDING) {
      // Scroll to show the highlighted thumbnail at the bottom
      container.scrollTop += thumbnailRect.bottom - (containerRect.bottom - this.SCROLL_PADDING);
    } else if (thumbnailRect.top < containerRect.top + this.SCROLL_PADDING) {
      // Scroll to show the highlighted thumbnail at the top
      container.scrollTop -= (containerRect.top + this.SCROLL_PADDING) - thumbnailRect.top;
    }
  }
}

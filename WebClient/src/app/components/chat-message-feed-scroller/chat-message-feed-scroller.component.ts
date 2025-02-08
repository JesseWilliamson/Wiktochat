import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { ChatMessageComponent } from '@app/components/chat-message/chat-message.component';
import { CommonModule } from '@angular/common';
import { ChatMessageHandlerService } from '@app/services/chat-message-handler.service';
import { ReadonlyCanvasComponent } from '../readonly-canvas/readonly-canvas.component';

@Component({
  selector: 'app-chat-message-feed-scroller',
  standalone: true,
  imports: [ChatMessageComponent, CommonModule, ReadonlyCanvasComponent],
  templateUrl: './chat-message-feed-scroller.component.html',
  styleUrl: './chat-message-feed-scroller.component.less',
})
export class ChatMessageFeedScrollerComponent {
  @ViewChild('thumbnailsContainer') thumbnailsContainer!: ElementRef;
  
  constructor(protected chatService: ChatMessageHandlerService) {}

  highlightedMessageId: string | null = null;
  private currentIndex = 0;
  private readonly SCROLL_PADDING = 20; // Padding to maintain at top/bottom

  @HostListener('wheel', ['$event'])
  onScroll(event: WheelEvent) {
    event.preventDefault();
    
    const messages = this.chatService.chatMessages();
    if (!messages.length) return;

    // For column-reverse, positive deltaY (scroll down) should decrease the index
    if (event.deltaY > 0) {
      // Scrolling down - move highlight up (decrease index)
      this.currentIndex = Math.max(this.currentIndex - 1, 0);
    } else {
      // Scrolling up - move highlight down (increase index)
      this.currentIndex = Math.min(this.currentIndex + 1, messages.length - 1);
    }

    this.highlightedMessageId = messages[this.currentIndex].id;
    this.scrollToHighlighted();
  }

  private scrollToHighlighted() {
    const container = this.thumbnailsContainer.nativeElement;
    const thumbnails = container.children;
    if (!thumbnails.length) return;

    // In column-reverse, the elements are in reverse order in the DOM
    const highlightedThumbnail = thumbnails[this.currentIndex];
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

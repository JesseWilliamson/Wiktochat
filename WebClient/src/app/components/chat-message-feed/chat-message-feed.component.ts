import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef, AfterViewInit, ViewChild, ElementRef, HostListener, computed, effect, inject, Signal } from '@angular/core';
import { ChatMessageComponent } from '@app/components/chat-message/chat-message.component';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { ChatMessageHandlerService } from '@app/services/chat-message-handler.service';
import { Subscription, tap } from 'rxjs';
import { ReadonlyCanvasComponent } from '../readonly-canvas/readonly-canvas.component';
import { GridMessage } from '@app/components/models/types';

@Component({
  selector: 'app-chat-message-feed',
  standalone: true,
  imports: [ChatMessageComponent, CommonModule, KeyValuePipe, ReadonlyCanvasComponent],
  templateUrl: './chat-message-feed.component.html',
  styleUrl: './chat-message-feed.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatMessageFeedComponent implements OnInit, OnDestroy, AfterViewInit {
  private messageSubscription?: Subscription;
  private scrollContainer: HTMLElement | null = null;
  private chatService = inject(ChatMessageHandlerService);
  
  @ViewChild('scrollAnchor') private scrollAnchor?: ElementRef<HTMLDivElement>;
  @ViewChild('thumbnailsContainer') private thumbnailsContainer?: ElementRef;
  @ViewChild('messageContainer') private messageContainer?: ElementRef;

  // Track messages and thumbnails
  chatMessages: Signal<GridMessage[]> = this.chatService.chatMessages;
  highlightedMessageId: string | null = null;
  private lastMessageId: string | null = null;
  private currentIndex = 0;
  private readonly SCROLL_PADDING = 20;

  // Computed property for thumbnails (newest first)
  thumbnails = computed<GridMessage[]>(() => {
    return [...this.chatMessages()].sort((a, b) =>
      new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime()
    );
  });

  constructor(
    private cdr: ChangeDetectorRef,
    private el: ElementRef
  ) {}

  private messageFeedElement: HTMLElement | null = null;

  ngOnInit() {
    // Subscribe to message updates
    this.messageSubscription = this.chatService.messages$.pipe(
      tap({
        next: (message) => {
          this.highlightedMessageId = message.id;
          this.lastMessageId = message.id;
          this.currentIndex = 0; // Reset to newest message
          this.cdr.detectChanges();
          this.scrollToBottom();
          this.scrollToHighlighted();
        },
        error: (error) => {
          console.error('Error in message feed:', error);
        }
      })
    ).subscribe();
  }

  ngAfterViewInit() {
    // Initialize scroll container
    this.scrollContainer = this.el.nativeElement.querySelector('.message-feed');
    
    // Set up effect to watch for message changes and auto-scroll
    effect(() => {
      const messages = this.chatMessages();
      if (messages.length > 0) {
        const newestMessage = messages[messages.length - 1];
        if (newestMessage.id !== this.lastMessageId) {
          this.highlightedMessageId = newestMessage.id;
          this.lastMessageId = newestMessage.id;
          this.currentIndex = messages.length - 1;
          
          // Scroll to show the highlighted message
          setTimeout(() => {
            this.scrollToBottom();
            this.scrollToHighlighted();
          }, 0);
        }
      }
    });
    // Get reference to the message feed element
    this.scrollContainer = this.el.nativeElement.querySelector('.message-feed');
    // Initial scroll to bottom
    this.scrollToBottom();
  }

  ngAfterViewChecked() {
    // Scroll to bottom when new messages arrive
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    if (this.scrollContainer && this.scrollAnchor) {
      try {
        this.scrollContainer.scrollTop = this.scrollContainer.scrollHeight;
      } catch (err) {
        // Silently handle scroll errors
      }
    }
  }

  // Get messages in chronological order (oldest first)
  get messages() {
    return [...this.chatService.chatMessages()].sort((a, b) =>
      new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime()
    );
  }

  // Track message by ID for better performance with *ngFor
  trackByMessageId(index: number, message: any): string {
    return message.id;
  }

  @HostListener('wheel', ['$event'])
  onScroll(event: WheelEvent) {
    if (event.target !== this.messageContainer?.nativeElement) return;
    
    event.preventDefault();
    const messages = this.chatMessages();
    if (!messages.length) return;

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

  scrollToMessage(direction: -1 | 1) {
    const messages = this.chatMessages();
    if (!messages.length) return;

    if (direction === -1) {
      // Scroll to newest (first message)
      this.currentIndex = messages.length - 1;
    } else {
      // Scroll to oldest (last message)
      this.currentIndex = 0;
    }
    
    this.highlightedMessageId = messages[this.currentIndex]?.id || null;
    this.scrollToHighlighted();
  }

  scrollToThumbnail(messageId: string) {
    const messages = this.chatMessages();
    const index = messages.findIndex((m) => m.id === messageId);
    if (index !== -1) {
      this.currentIndex = index;
      this.highlightedMessageId = messageId;
      this.scrollToHighlighted();
    }
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

    if (thumbnailRect.bottom > containerRect.bottom - this.SCROLL_PADDING) {
      container.scrollTop += thumbnailRect.bottom - (containerRect.bottom - this.SCROLL_PADDING);
    } else if (thumbnailRect.top < containerRect.top + this.SCROLL_PADDING) {
      container.scrollTop -= (containerRect.top + this.SCROLL_PADDING) - thumbnailRect.top;
    }
  }

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }
}

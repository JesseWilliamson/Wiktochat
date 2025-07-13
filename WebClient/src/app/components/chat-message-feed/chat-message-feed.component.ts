import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  AfterViewInit,
  ViewChild,
  ElementRef,
  computed,
  inject,
  DestroyRef,
  type Signal,
  effect
} from '@angular/core';
import { ChatMessageComponent } from '@app/components/chat-message/chat-message.component';
import { CommonModule } from '@angular/common';
import { ChatMessageHandlerService } from '@app/services/chat-message-handler.service';
import { ReadonlyCanvasComponent } from '../readonly-canvas/readonly-canvas.component';
import { GridMessage } from '@app/components/models/types';

@Component({
  selector: 'app-chat-message-feed',
  standalone: true,
  imports: [ChatMessageComponent, CommonModule, ReadonlyCanvasComponent],
  templateUrl: './chat-message-feed.component.html',
  styleUrl: './chat-message-feed.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatMessageFeedComponent implements OnInit, AfterViewInit {
  // Dependency injection
  private readonly chatService = inject(ChatMessageHandlerService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly el = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  // View children
  @ViewChild('messageContainer') private messageContainer?: ElementRef<HTMLElement>;

  // DOM references
  private scrollContainer: HTMLElement | null = null;

  // State management
  private _rawMessages: Signal<GridMessage[]> = this.chatService.chatMessages;

  // Computed property to ensure messages are sorted chronologically (oldest at top, newest at bottom)
  chatMessages = computed(() => {
    const messages = [...this._rawMessages()];
    return messages.sort((a, b) => new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime());
  });
  private shouldAutoScroll = true;

  // Emoji button state
  showEmojiPicker = false;

  ngOnInit(): void {
    // Use a Set to track processed message IDs and prevent duplicates
    const processedMessageIds = new Set<string>();

    // Use effect to react to new messages
    effect(() => {
      const latestMessage = this.chatService.latestMessage();

      // Skip null messages (initial state)
      if (!latestMessage) {
        return;
      }

      // Skip if we've already processed this message
      if (processedMessageIds.has(latestMessage.id)) {
        console.log('Skipping duplicate message in feed:', latestMessage.id);
        return;
      }

      // Mark this message as processed
      processedMessageIds.add(latestMessage.id);

      if (this.shouldAutoScroll) {
        this.cdr.detectChanges();
        requestAnimationFrame(() => this.scrollToBottom());
      }
    });
  }

  /**
   * Scrolls the message container to the bottom
   */
  private scrollToBottom(): void {
    if (this.scrollContainer) {
      try {
        this.scrollContainer.scrollTop = this.scrollContainer.scrollHeight;
      } catch (err) {
        console.warn('Error scrolling to bottom:', err);
      }
    }
  }

  ngAfterViewInit(): void {
    // Initialize scroll container
    this.scrollContainer = this.el.nativeElement.querySelector('.message-feed');

    // Initial scroll to bottom
    this.scrollToBottom();
  }

  /**
   * Track message by ID and index for better performance with *ngFor
   * Using both index and ID to ensure uniqueness even if duplicate IDs exist
   */
  trackByMessageId(index: number, message: GridMessage): string {
    return `${index}-${message.id}`;
  }

  /**
   * Toggle emoji picker visibility
   */
  toggleEmojiPicker(): void {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  // No need for ngOnDestroy as we're using takeUntilDestroyed
}

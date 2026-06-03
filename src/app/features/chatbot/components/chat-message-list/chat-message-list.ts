import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { ChatIcon } from '../chat-icon/chat-icon';
import { PropertyChatCard } from '../property-chat-card/property-chat-card';
import { RecommendationPanel } from '../recommendation-panel/recommendation-panel';
import { ChatMessage, PropertyCard } from '../../models/chatbot.model';
import { trackPropertyCard } from '../../utils/chatbot-normalizer';

@Component({
  selector: 'app-chat-message-list',
  imports: [ChatIcon, PropertyChatCard, RecommendationPanel, TranslatePipe, DatePipe],
  templateUrl: './chat-message-list.html',
  styleUrl: './chat-message-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatMessageList {
  readonly messages = input.required<ChatMessage[]>();
  readonly loading = input(false);
  readonly retry = output<void>();
  private pendingRafId: number | null = null;
  private pendingTimeoutId: ReturnType<typeof setTimeout> | null = null;

  private readonly scrollAnchor =
    viewChild<ElementRef<HTMLDivElement>>('scrollAnchor');

  constructor() {
    effect(() => {
      const messageCount = this.messages().length;
      const isLoading = this.loading();

      if (messageCount > 0 || isLoading) {
        this.scheduleScrollToBottom();
      }
    });
  }

  private scheduleScrollToBottom(): void {
    if (this.pendingRafId !== null || this.pendingTimeoutId !== null) {
      return;
    }

    this.pendingTimeoutId = setTimeout(() => {
      this.pendingTimeoutId = null;
      const raf = globalThis.requestAnimationFrame;

      if (raf) {
        this.pendingRafId = raf(() => {
          this.pendingRafId = null;
          this.scrollToBottom();
        });
        return;
      }

      this.scrollToBottom();
    }, 0);
  }

  scrollToBottom(): void {
    const el = this.scrollAnchor()?.nativeElement;
    if (el && typeof el.scrollIntoView === 'function') {
      const prefersReducedMotion =
        globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

      el.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'end',
      });
    }
  }

  isUser(msg: ChatMessage): boolean {
    return msg.role === 'user';
  }

  isError(msg: ChatMessage): boolean {
    return msg.kind === 'error';
  }

  requestRetry(): void {
    if (!this.loading()) {
      this.retry.emit();
    }
  }

  isRecommend(msg: ChatMessage): boolean {
    return msg.module === 'Recommend' && !!msg.recommendation;
  }

  isSearch(msg: ChatMessage): boolean {
    return (msg.module === 'Search' || msg.module === 'Selection') && !!msg.properties?.length;
  }

  isCompare(msg: ChatMessage): boolean {
    return msg.module === 'Compare' && !!msg.comparison?.length;
  }

  isNegotiate(msg: ChatMessage): boolean {
    return msg.module === 'Negotiate' && !!msg.negotiation;
  }

  trackProperty(index: number, property: PropertyCard): number | string {
    return trackPropertyCard(index, property);
  }
}

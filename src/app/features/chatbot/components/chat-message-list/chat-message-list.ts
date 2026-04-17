import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  effect,
  input,
  viewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { PropertyChatCard } from '../property-chat-card/property-chat-card';
import { RecommendationPanel } from '../recommendation-panel/recommendation-panel';
import { ChatMessage } from '../../models/chatbot.model';

@Component({
  selector: 'app-chat-message-list',
  imports: [PropertyChatCard, RecommendationPanel, TranslatePipe, DatePipe],
  templateUrl: './chat-message-list.html',
  styleUrl: './chat-message-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatMessageList {
  readonly messages = input.required<ChatMessage[]>();
  readonly loading = input(false);
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

    afterNextRender(() => {
      const raf = globalThis.requestAnimationFrame;

      if (raf) {
        this.pendingRafId = raf(() => {
          this.pendingRafId = null;
          this.scrollToBottom();
        });
        return;
      }

      this.pendingTimeoutId = setTimeout(() => {
        this.pendingTimeoutId = null;
        this.scrollToBottom();
      }, 0);
    });
  }

  scrollToBottom(): void {
    const el = this.scrollAnchor()?.nativeElement;
    if (el) {
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

  isRecommend(msg: ChatMessage): boolean {
    return msg.module === 'Recommend' && !!msg.recommendation;
  }

  isSearch(msg: ChatMessage): boolean {
    return (msg.module === 'Search' || msg.module === 'Selection') && !!msg.properties?.length;
  }
}

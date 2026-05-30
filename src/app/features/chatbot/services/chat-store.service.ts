import { computed, inject, Injectable, signal } from '@angular/core';
import { ChatbotApiService } from './chatbot-api.service';
import { ChatRuntimeService } from './chat-runtime.service';
import {
  ChatMessage,
  PropertyCard,
  AdvisorModule,
} from '../models/chatbot.model';
import {
  CHATBOT_ERROR_TEXT_KEY,
  limitChatMessages,
  normalizeAdvisorResponse,
} from '../utils/chatbot-normalizer';

const CHATBOT_TIMEOUT_TEXT_KEY = 'CHATBOT.ERROR_TIMEOUT';

@Injectable({ providedIn: 'root' })
export class ChatStore {
  private readonly api = inject(ChatbotApiService);
  private readonly runtime = inject(ChatRuntimeService);

  readonly messages = signal<ChatMessage[]>([]);
  readonly loading = signal(false);
  readonly isOpen = signal(false);
  readonly activeModule = signal<AdvisorModule | null>(null);
  readonly topProperties = signal<PropertyCard[]>([]);
  readonly recommendation = signal<PropertyCard | null>(null);
  readonly lastQuery = signal('');

  readonly hasMessages = computed(() => this.messages().length > 0);

  private requestVersion = 0;

  toggleOpen(): void {
    this.isOpen.update(v => !v);
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  sendMessage(text: string): void {
    const trimmed = text.trim();
    if (!trimmed || this.loading()) return;

    this.lastQuery.set(trimmed);

    const userMsg: ChatMessage = {
      id: this.runtime.createMessageId(),
      role: 'user',
      text: trimmed,
      timestamp: this.runtime.now(),
    };
    this.appendMessage(userMsg);
    this.loading.set(true);

    const userId = this.runtime.getOrCreateGuestId();
    const requestVersion = ++this.requestVersion;

    this.api.askAdvisor({ user_id: userId, query: trimmed }).subscribe({
      next: res => this.handleAdvisorResponse(res, requestVersion),
      error: error => this.handleError(requestVersion, error),
    });
  }

  retryLastMessage(): void {
    const q = this.lastQuery();
    if (q) this.sendMessage(q);
  }

  clearChat(): void {
    this.requestVersion += 1;
    this.messages.set([]);
    this.loading.set(false);
    this.activeModule.set(null);
    this.topProperties.set([]);
    this.recommendation.set(null);
    this.lastQuery.set('');
  }

  private handleAdvisorResponse(res: unknown, requestVersion: number): void {
    if (requestVersion !== this.requestVersion) return;

    const normalized = normalizeAdvisorResponse(res);
    this.loading.set(false);
    this.activeModule.set(normalized.module);

    if (normalized.topProperties.length) {
      this.topProperties.set(normalized.topProperties);
    }
    if (normalized.recommendation) {
      this.recommendation.set(normalized.recommendation);
    }
    if (normalized.comparison.length) {
      this.topProperties.update(current => {
        const ids = new Set(current.map(p => p.propertyId));
        const unique = normalized.comparison.filter(p => !ids.has(p.propertyId));
        return [...current, ...unique];
      });
    }

    const assistantMsg: ChatMessage = {
      id: this.runtime.createMessageId(),
      role: 'assistant',
      text: normalized.text,
      translationKey: normalized.translationKey,
      kind: normalized.translationKey ? 'error' : 'message',
      timestamp: this.runtime.now(),
      properties: normalized.topProperties.length ? normalized.topProperties : undefined,
      recommendation: normalized.recommendation ?? undefined,
      comparison: normalized.comparison.length ? normalized.comparison : undefined,
      negotiation: normalized.negotiation ?? undefined,
      module: normalized.module,
      fallbackUsed: normalized.fallbackUsed,
    };
    this.appendMessage(assistantMsg);
  }

  private handleError(requestVersion: number, error: unknown): void {
    if (requestVersion !== this.requestVersion) return;

    this.loading.set(false);
    const errorMsg: ChatMessage = {
      id: this.runtime.createMessageId(),
      role: 'assistant',
      text: '',
      translationKey: this.isTimeoutError(error) ? CHATBOT_TIMEOUT_TEXT_KEY : CHATBOT_ERROR_TEXT_KEY,
      kind: 'error',
      timestamp: this.runtime.now(),
    };
    this.appendMessage(errorMsg);
  }

  private isTimeoutError(error: unknown): boolean {
    return error instanceof Error && error.name === 'TimeoutError';
  }

  private appendMessage(message: ChatMessage): void {
    this.messages.update(msgs => limitChatMessages([...msgs, message]));
  }
}

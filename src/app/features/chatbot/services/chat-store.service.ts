import { inject, Injectable, PLATFORM_ID, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ChatbotApiService } from './chatbot-api.service';
import {
  AdvisorResponse,
  ChatMessage,
  PropertyCard,
  AdvisorModule,
} from '../models/chatbot.model';

const GUEST_ID_KEY = 'estatepilot_guest_user_id';

@Injectable({ providedIn: 'root' })
export class ChatStore {
  private readonly api = inject(ChatbotApiService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly messages = signal<ChatMessage[]>([]);
  readonly loading = signal(false);
  readonly isOpen = signal(false);
  readonly activeModule = signal<AdvisorModule | null>(null);
  readonly topProperties = signal<PropertyCard[]>([]);
  readonly recommendation = signal<PropertyCard | null>(null);
  readonly lastQuery = signal('');

  readonly hasMessages = computed(() => this.messages().length > 0);

  private getOrCreateGuestId(): number {
    if (isPlatformBrowser(this.platformId)) {
      const existing = localStorage.getItem(GUEST_ID_KEY);
      if (existing) {
        const parsed = Number(existing);
        if (!Number.isNaN(parsed)) return parsed;
      }
      const newId = Math.floor(Math.random() * 1_000_000) + 1;
      localStorage.setItem(GUEST_ID_KEY, String(newId));
      return newId;
    }
    return 0;
  }

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
      id: crypto.randomUUID(),
      role: 'user',
      text: trimmed,
      timestamp: Date.now(),
    };
    this.messages.update(msgs => [...msgs, userMsg]);
    this.loading.set(true);

    const userId = this.getOrCreateGuestId();

    this.api.askAdvisor({ user_id: userId, query: trimmed }).subscribe({
      next: res => this.handleAdvisorResponse(res),
      error: () => this.handleError(),
    });
  }

  retryLastMessage(): void {
    const q = this.lastQuery();
    if (q) this.sendMessage(q);
  }

  clearChat(): void {
    this.messages.set([]);
    this.activeModule.set(null);
    this.topProperties.set([]);
    this.recommendation.set(null);
    this.lastQuery.set('');
  }

  private handleAdvisorResponse(res: AdvisorResponse): void {
    this.loading.set(false);
    this.activeModule.set(res.module);

    if (res.top_properties?.length) {
      this.topProperties.set(res.top_properties);
    }
    if (res.recommendation) {
      this.recommendation.set(res.recommendation);
    }
    if (res.comparison?.length) {
      this.topProperties.update(current => {
        const ids = new Set(current.map(p => p.propertyId));
        const unique = res.comparison!.filter(p => !ids.has(p.propertyId));
        return [...current, ...unique];
      });
    }

    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      text: res.reply_in_egyptian_arabic || res.explanation,
      timestamp: Date.now(),
      properties: res.top_properties?.length ? res.top_properties : undefined,
      recommendation: res.recommendation ?? undefined,
      module: res.module,
      fallbackUsed: res.fallback_used,
    };
    this.messages.update(msgs => [...msgs, assistantMsg]);
  }

  private handleError(): void {
    this.loading.set(false);
    const errorMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      text: 'CHATBOT.ERROR_GENERIC',
      timestamp: Date.now(),
    };
    this.messages.update(msgs => [...msgs, errorMsg]);
  }
}

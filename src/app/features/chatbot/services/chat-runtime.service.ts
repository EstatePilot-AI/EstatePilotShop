import { inject, Injectable, InjectionToken, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

const GUEST_ID_KEY = 'estatepilot_guest_user_id';

export const CHATBOT_RANDOM = new InjectionToken<() => number>('CHATBOT_RANDOM', {
  factory: () => Math.random,
});

export const CHATBOT_NOW = new InjectionToken<() => number>('CHATBOT_NOW', {
  factory: () => Date.now,
});

@Injectable({ providedIn: 'root' })
export class ChatRuntimeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly random = inject(CHATBOT_RANDOM);
  private readonly nowFactory = inject(CHATBOT_NOW);

  getOrCreateGuestId(): number {
    if (!isPlatformBrowser(this.platformId)) {
      return 0;
    }

    const existing = localStorage.getItem(GUEST_ID_KEY);
    if (existing) {
      const parsed = Number(existing);
      if (Number.isFinite(parsed) && parsed > 0) return Math.trunc(parsed);
    }

    const newId = Math.floor(this.random() * 1_000_000) + 1;
    localStorage.setItem(GUEST_ID_KEY, String(newId));
    return newId;
  }

  createMessageId(): string {
    if (isPlatformBrowser(this.platformId)) {
      return globalThis.crypto?.randomUUID?.() ?? this.createFallbackMessageId();
    }

    return this.createFallbackMessageId();
  }

  now(): number {
    return this.nowFactory();
  }

  private createFallbackMessageId(): string {
    return `chat-${this.now()}-${Math.floor(this.random() * 1_000_000)}`;
  }
}

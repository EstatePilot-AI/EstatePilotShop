import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  CHATBOT_NOW,
  CHATBOT_RANDOM,
  ChatRuntimeService,
} from './chat-runtime.service';

const GUEST_ID_KEY = 'estatepilot_guest_user_id';

describe('ChatRuntimeService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns an existing valid guest id from localStorage', () => {
    localStorage.setItem(GUEST_ID_KEY, '42');
    TestBed.configureTestingModule({
      providers: [ChatRuntimeService, { provide: PLATFORM_ID, useValue: 'browser' }],
    });

    expect(TestBed.inject(ChatRuntimeService).getOrCreateGuestId()).toBe(42);
  });

  it('replaces an invalid guest id with a deterministic generated id', () => {
    localStorage.setItem(GUEST_ID_KEY, 'bad');
    TestBed.configureTestingModule({
      providers: [
        ChatRuntimeService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: CHATBOT_RANDOM, useValue: () => 0.5 },
      ],
    });

    expect(TestBed.inject(ChatRuntimeService).getOrCreateGuestId()).toBe(500001);
    expect(localStorage.getItem(GUEST_ID_KEY)).toBe('500001');
  });

  it('uses safe deterministic fallbacks outside the browser', () => {
    TestBed.configureTestingModule({
      providers: [
        ChatRuntimeService,
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: CHATBOT_NOW, useValue: () => 1234 },
      ],
    });

    const runtime = TestBed.inject(ChatRuntimeService);

    expect(runtime.getOrCreateGuestId()).toBe(0);
    expect(runtime.now()).toBe(1234);
    expect(runtime.createMessageId()).toMatch(/^chat-/);
  });
});

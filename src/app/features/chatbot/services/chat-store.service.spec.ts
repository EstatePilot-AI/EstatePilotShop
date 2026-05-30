import { TestBed } from '@angular/core/testing';
import { Subject, throwError } from 'rxjs';
import { ChatbotApiService } from './chatbot-api.service';
import { ChatStore } from './chat-store.service';
import {
  CHATBOT_NOW,
  CHATBOT_RANDOM,
  ChatRuntimeService,
} from './chat-runtime.service';
import { AdvisorResponse } from '../models/chatbot.model';

function response(partial: Partial<AdvisorResponse> = {}): AdvisorResponse {
  return {
    module: 'Search',
    filters_extracted: {},
    top_properties: [],
    recommendation: null,
    comparison: null,
    negotiation: null,
    fallback_used: false,
    explanation: 'Here are matches',
    reply_in_egyptian_arabic: '',
    ...partial,
  };
}

describe('ChatStore', () => {
  let api: { askAdvisor: ReturnType<typeof vi.fn> };
  let now = 1000;

  beforeEach(() => {
    api = { askAdvisor: vi.fn() };
    now = 1000;
    TestBed.configureTestingModule({
      providers: [
        ChatStore,
        ChatRuntimeService,
        { provide: ChatbotApiService, useValue: api },
        { provide: CHATBOT_RANDOM, useValue: () => 0.1 },
        { provide: CHATBOT_NOW, useValue: () => now++ },
      ],
    });
  });

  it('adds a user message and normalized assistant response for the happy path', () => {
    const pending = new Subject<AdvisorResponse>();
    api.askAdvisor.mockReturnValue(pending);
    const store = TestBed.inject(ChatStore);

    store.sendMessage('  find apartments  ');
    pending.next(response({ reply_in_egyptian_arabic: 'تمام' }));
    pending.complete();

    expect(api.askAdvisor).toHaveBeenCalledWith({ user_id: expect.any(Number), query: 'find apartments' });
    expect(store.messages().map((message) => message.role)).toEqual(['user', 'assistant']);
    expect(store.messages()[1].text).toBe('تمام');
    expect(store.loading()).toBe(false);
  });

  it('ignores stale responses after clearChat cancels an active request', () => {
    const pending = new Subject<AdvisorResponse>();
    api.askAdvisor.mockReturnValue(pending);
    const store = TestBed.inject(ChatStore);

    store.sendMessage('hello');
    store.clearChat();
    pending.next(response({ explanation: 'late response' }));

    expect(store.messages()).toEqual([]);
    expect(store.loading()).toBe(false);
  });

  it('adds a generic assistant error message when the API fails', () => {
    api.askAdvisor.mockReturnValue(throwError(() => new Error('network')));
    const store = TestBed.inject(ChatStore);

    store.sendMessage('hello');

    expect(store.messages()).toHaveLength(2);
    expect(store.messages()[1]).toEqual(expect.objectContaining({
      role: 'assistant',
      text: '',
      translationKey: 'CHATBOT.ERROR_GENERIC',
      kind: 'error',
    }));
    expect(store.loading()).toBe(false);
  });

  it('adds a friendly timeout error message when the advisor takes too long', () => {
    const timeoutError = new Error('Timeout has occurred');
    timeoutError.name = 'TimeoutError';
    api.askAdvisor.mockReturnValue(throwError(() => timeoutError));
    const store = TestBed.inject(ChatStore);

    store.sendMessage('hello');

    expect(store.messages()[1]).toEqual(expect.objectContaining({
      role: 'assistant',
      text: '',
      translationKey: 'CHATBOT.ERROR_TIMEOUT',
      kind: 'error',
    }));
    expect(store.loading()).toBe(false);
  });

  it('retries the latest user query after an error response', () => {
    api.askAdvisor.mockReturnValue(throwError(() => new Error('network')));
    const store = TestBed.inject(ChatStore);

    store.sendMessage('hello');
    store.retryLastMessage();

    expect(api.askAdvisor).toHaveBeenCalledTimes(2);
    expect(api.askAdvisor).toHaveBeenLastCalledWith({
      user_id: expect.any(Number),
      query: 'hello',
    });
  });

  it('retains only the latest one hundred messages', () => {
    api.askAdvisor.mockReturnValue(throwError(() => new Error('network')));
    const store = TestBed.inject(ChatStore);

    for (let index = 0; index < 60; index += 1) {
      store.sendMessage(`message ${index}`);
    }

    expect(store.messages()).toHaveLength(100);
    expect(store.messages()[0].text).toBe('message 10');
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { ChatMessageList } from './chat-message-list';
import { ChatMessage } from '../../models/chatbot.model';

describe('ChatMessageList', () => {
  let fixture: ComponentFixture<ChatMessageList>;
  let component: ChatMessageList;

  const messages: ChatMessage[] = [
    {
      id: 'user-1',
      role: 'user',
      text: 'شقة في الرحاب',
      timestamp: 1000,
    },
    {
      id: 'assistant-1',
      role: 'assistant',
      text: '',
      translationKey: 'CHATBOT.ERROR_TIMEOUT',
      kind: 'error',
      timestamp: 1001,
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatMessageList],
      providers: [provideTranslateService({ fallbackLang: 'en' })],
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      CHATBOT: {
        ERROR_TIMEOUT: 'The advisor is taking longer than usual. Please try again.',
        RETRY: 'Try again',
      },
    });
    translate.use('en');

    fixture = TestBed.createComponent(ChatMessageList);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('messages', messages);
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
  });

  it('renders user and assistant messages with distinct row classes', () => {
    const rows = fixture.nativeElement.querySelectorAll('.msg-list__row');

    expect(rows).toHaveLength(2);
    expect(rows[0].classList).toContain('msg-list__row--user');
    expect(rows[1].classList).not.toContain('msg-list__row--user');
  });

  it('renders a user avatar beside user messages and a bot avatar beside assistant messages', () => {
    expect(fixture.nativeElement.querySelector('.msg-list__avatar--user')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.msg-list__avatar--bot')).not.toBeNull();
  });

  it('places the user avatar before the user bubble', () => {
    const userRow: HTMLElement | null =
      fixture.nativeElement.querySelector('.msg-list__row--user');
    const userAvatar = userRow?.querySelector('.msg-list__avatar--user');
    const userBubble = userRow?.querySelector('.msg-list__bubble--user');

    expect(userAvatar).not.toBeNull();
    expect(userBubble).not.toBeNull();
    expect(userAvatar?.compareDocumentPosition(userBubble as Node))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('renders translated local error text instead of a raw translation key', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('The advisor is taking longer than usual. Please try again.');
    expect(text).not.toContain('CHATBOT.ERROR_TIMEOUT');
  });

  it('does not throw when scrollIntoView is unavailable', () => {
    expect(() => component.scrollToBottom()).not.toThrow();
  });

  it('emits retry when the error retry button is clicked', () => {
    const emitted: void[] = [];
    component.retry.subscribe(() => emitted.push(undefined));

    const retryButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('.msg-list__retry');
    expect(retryButton?.disabled).toBe(false);
    fixture.debugElement.query(By.css('.msg-list__retry')).triggerEventHandler('click');

    expect(retryButton).not.toBeNull();
    expect(emitted).toHaveLength(1);
  });
});

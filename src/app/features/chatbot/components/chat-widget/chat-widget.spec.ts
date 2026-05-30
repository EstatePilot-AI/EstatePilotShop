import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { ChatWidget } from './chat-widget';
import { ChatStore } from '../../services/chat-store.service';
import { TranslationService } from '../../../../core/services/translation.service';

describe('ChatWidget', () => {
  let fixture: ComponentFixture<ChatWidget>;
  let store: {
    isOpen: () => boolean;
    messages: () => never[];
    loading: () => boolean;
    hasMessages: () => boolean;
    toggleOpen: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
    sendMessage: ReturnType<typeof vi.fn>;
    clearChat: ReturnType<typeof vi.fn>;
    retryLastMessage: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    store = {
      isOpen: () => true,
      messages: () => [],
      loading: () => false,
      hasMessages: () => false,
      toggleOpen: vi.fn(),
      close: vi.fn(),
      sendMessage: vi.fn(),
      clearChat: vi.fn(),
      retryLastMessage: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ChatWidget],
      providers: [
        provideTranslateService({ fallbackLang: 'en' }),
        { provide: ChatStore, useValue: store },
        { provide: TranslationService, useValue: { isRtl: () => false } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatWidget);
    fixture.detectChanges();
  });

  it('keeps the welcome state but does not render suggestion chips', () => {
    expect(fixture.nativeElement.querySelector('.chat-welcome')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.chat-welcome__greeting')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.chat-welcome__chip')).toBeNull();
  });
});

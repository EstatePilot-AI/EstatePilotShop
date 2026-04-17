import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ChatMessageList } from '../chat-message-list/chat-message-list';
import { ChatComposer } from '../chat-composer/chat-composer';
import { ChatStore } from '../../services/chat-store.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-chat-widget',
  imports: [ChatMessageList, ChatComposer, TranslatePipe],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class ChatWidget {
  readonly store = inject(ChatStore);
  private readonly translation = inject(TranslationService);
  private readonly translateService = inject(TranslateService);

  readonly isOpen = this.store.isOpen;
  readonly messages = this.store.messages;
  readonly loading = this.store.loading;
  readonly hasMessages = this.store.hasMessages;

  readonly direction = computed(() => this.translation.isRtl() ? 'rtl' : 'ltr');

  readonly suggestions = computed(() => [
    'CHATBOT.SUGGESTION_SEARCH',
    'CHATBOT.SUGGESTION_RECOMMEND',
    'CHATBOT.SUGGESTION_COMPARE',
  ]);

  readonly translatedSuggestions = computed(() =>
    this.suggestions().map(key => this.translateService.instant(key))
  );

  toggle(): void {
    this.store.toggleOpen();
  }

  close(): void {
    this.store.close();
  }

  sendMessage(text: string): void {
    this.store.sendMessage(text);
  }

  clearChat(): void {
    this.store.clearChat();
  }

  onEscape(): void {
    if (this.isOpen()) {
      this.close();
    }
  }
}

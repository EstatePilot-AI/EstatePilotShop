import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ChatMessageList } from '../chat-message-list/chat-message-list';
import { ChatComposer } from '../chat-composer/chat-composer';
import { ChatStore } from '../../services/chat-store.service';
import { TranslationService } from '../../../../core/services/translation.service';

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
  private readonly openButton =
    viewChild<ElementRef<HTMLButtonElement>>('openButton');

  readonly isOpen = this.store.isOpen;
  readonly messages = this.store.messages;
  readonly loading = this.store.loading;
  readonly hasMessages = this.store.hasMessages;

  readonly direction = computed(() => this.translation.isRtl() ? 'rtl' : 'ltr');

  toggle(): void {
    this.store.toggleOpen();
  }

  close(): void {
    this.store.close();
    queueMicrotask(() => {
      this.openButton()?.nativeElement.focus();
    });
  }

  sendMessage(text: string): void {
    this.store.sendMessage(text);
  }

  clearChat(): void {
    this.store.clearChat();
  }

  retryLastMessage(): void {
    this.store.retryLastMessage();
  }

  onEscape(): void {
    if (this.isOpen()) {
      this.close();
    }
  }
}

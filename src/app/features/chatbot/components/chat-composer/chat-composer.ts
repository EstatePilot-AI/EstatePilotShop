import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-chat-composer',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './chat-composer.html',
  styleUrl: './chat-composer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComposer {
  readonly disabled = input(false);
  readonly send = output<string>();
  readonly messageControl = new FormControl('', { nonNullable: true });

  private readonly messageInput =
    viewChild<ElementRef<HTMLTextAreaElement>>('messageInput');

  constructor() {
    afterNextRender(() => {
      this.messageInput()?.nativeElement.focus();
    });

    effect(() => {
      if (this.disabled()) {
        this.messageControl.disable({ emitEvent: false });
        return;
      }

      this.messageControl.enable({ emitEvent: false });
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submit();
    }
  }

  submit(): void {
    const trimmed = this.messageControl.value.trim();
    if (!trimmed || this.disabled()) return;
    this.send.emit(trimmed);
    this.messageControl.reset('');
  }
}

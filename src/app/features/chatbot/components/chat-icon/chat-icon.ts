import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type ChatIconName =
  | 'area'
  | 'bath'
  | 'bed'
  | 'bot'
  | 'building'
  | 'close'
  | 'image'
  | 'pin'
  | 'send'
  | 'star'
  | 'trash'
  | 'user'
  | 'view';

@Component({
  selector: 'app-chat-icon',
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      [attr.fill]="filled() ? 'currentColor' : 'none'"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.aria-hidden]="decorative()"
      [attr.role]="decorative() ? null : 'img'"
    >
      @switch (name()) {
        @case ('area') {
          <path d="M3 3h18v18H3z" /><path d="M3 9h18" /><path d="M9 21V9" />
        }
        @case ('bath') {
          <path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
          <line x1="10" x2="8" y1="5" y2="7" /><line x1="2" x2="22" y1="12" y2="12" />
        }
        @case ('bed') {
          <path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 2 2v10" />
          <path d="M2 17h20" /><path d="M6 8v9" />
        }
        @case ('building') {
          <rect width="16" height="18" x="4" y="3" rx="2" /><path d="M9 7h6" />
          <path d="M9 11h6" /><path d="M9 15h4" />
        }
        @case ('close') {
          <path d="M18 6 6 18" /><path d="M6 6 12 12 18 18" />
        }
        @case ('image') {
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        }
        @case ('pin') {
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        }
        @case ('send') {
          <path d="M22 2 11 13" /><path d="M22 2 15 22 11 13 2 9z" />
        }
        @case ('star') {
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        }
        @case ('trash') {
          <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        }
        @case ('user') {
          <path d="M19 21a7 7 0 0 0-14 0" />
          <circle cx="12" cy="8" r="4" />
        }
        @case ('view') {
          <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
        }
        @default {
          <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" />
          <path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
        }
      }
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatIcon {
  readonly name = input<ChatIconName>('bot');
  readonly size = input(16);
  readonly strokeWidth = input(2);
  readonly filled = input(false);
  readonly decorative = input(true);
}

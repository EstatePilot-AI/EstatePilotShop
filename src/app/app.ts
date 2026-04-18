import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, startWith } from 'rxjs/operators';
import { Navbar } from './shared/components/navbar/navbar';
import { ToastModule } from 'primeng/toast';
import { ChatWidget } from './features/chatbot/components/chat-widget/chat-widget';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, ToastModule, ChatWidget],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly hideChatWidget = signal(false);

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        startWith(new NavigationEnd(0, this.router.url, this.router.url)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.hideChatWidget.set(this.router.url.includes('/properties/update/'));
      });
  }

}

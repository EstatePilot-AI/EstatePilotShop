import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { RevealDirective } from '../../../../shared/directives/reveal.directive';

interface ContactChannel {
  icon: string;
  titleKey: string;
  bodyKey: string;
  ctaKey: string;
  subject: string;
}

@Component({
  selector: 'app-contact-page',
  imports: [TranslatePipe, RevealDirective],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPage {
  protected readonly contactEmail = signal('shop@estatepilot.com');

  protected readonly channels = computed<ContactChannel[]>(() => [
    {
      icon: 'pi pi-building',
      titleKey: 'CONTACT_PAGE.CHANNELS.BUSINESS.TITLE',
      bodyKey: 'CONTACT_PAGE.CHANNELS.BUSINESS.BODY',
      ctaKey: 'CONTACT_PAGE.CHANNELS.BUSINESS.CTA',
      subject: 'EstatePilot business inquiry',
    },
    {
      icon: 'pi pi-handshake',
      titleKey: 'CONTACT_PAGE.CHANNELS.PARTNERSHIP.TITLE',
      bodyKey: 'CONTACT_PAGE.CHANNELS.PARTNERSHIP.BODY',
      ctaKey: 'CONTACT_PAGE.CHANNELS.PARTNERSHIP.CTA',
      subject: 'EstatePilot partnership inquiry',
    },
    {
      icon: 'pi pi-comments',
      titleKey: 'CONTACT_PAGE.CHANNELS.SUPPORT.TITLE',
      bodyKey: 'CONTACT_PAGE.CHANNELS.SUPPORT.BODY',
      ctaKey: 'CONTACT_PAGE.CHANNELS.SUPPORT.CTA',
      subject: 'EstatePilot support inquiry',
    },
  ]);

  protected mailtoLink(subject: string): string {
    return `mailto:${this.contactEmail()}?subject=${encodeURIComponent(subject)}`;
  }
}

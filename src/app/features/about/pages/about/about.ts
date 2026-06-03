import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { RevealDirective } from '../../../../shared/directives/reveal.directive';

interface AboutFeature {
  icon: string;
  titleKey: string;
  bodyKey: string;
}

@Component({
  selector: 'app-about-page',
  imports: [RouterLink, TranslatePipe, RevealDirective],
  templateUrl: './about.html',
  styleUrl: './about.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPage {
  protected readonly businessModelItems = signal<AboutFeature[]>([
    {
      icon: 'pi pi-briefcase',
      titleKey: 'ABOUT_PAGE.BUSINESS.PARTNERSHIPS_TITLE',
      bodyKey: 'ABOUT_PAGE.BUSINESS.PARTNERSHIPS_BODY',
    },
    {
      icon: 'pi pi-chart-line',
      titleKey: 'ABOUT_PAGE.BUSINESS.SUBSCRIPTIONS_TITLE',
      bodyKey: 'ABOUT_PAGE.BUSINESS.SUBSCRIPTIONS_BODY',
    },
    {
      icon: 'pi pi-database',
      titleKey: 'ABOUT_PAGE.BUSINESS.REVENUE_TITLE',
      bodyKey: 'ABOUT_PAGE.BUSINESS.REVENUE_BODY',
    },
  ]);

  protected readonly systemItems = signal<AboutFeature[]>([
    {
      icon: 'pi pi-desktop',
      titleKey: 'ABOUT_PAGE.SYSTEM.DASHBOARD_TITLE',
      bodyKey: 'ABOUT_PAGE.SYSTEM.DASHBOARD_BODY',
    },
    {
      icon: 'pi pi-phone',
      titleKey: 'ABOUT_PAGE.SYSTEM.CAMPAIGNS_TITLE',
      bodyKey: 'ABOUT_PAGE.SYSTEM.CAMPAIGNS_BODY',
    },
    {
      icon: 'pi pi-filter',
      titleKey: 'ABOUT_PAGE.SYSTEM.QUALIFICATION_TITLE',
      bodyKey: 'ABOUT_PAGE.SYSTEM.QUALIFICATION_BODY',
    },
    {
      icon: 'pi pi-sitemap',
      titleKey: 'ABOUT_PAGE.SYSTEM.INTEGRATIONS_TITLE',
      bodyKey: 'ABOUT_PAGE.SYSTEM.INTEGRATIONS_BODY',
    },
  ]);

  protected readonly teamMembers = signal([
    'Youssef Mohamed Abdelrahman',
    'Hanan Hany Fathy',
    'Marslino Edward Helmy',
    'Mazen Ahmed Mahmoud',
    'Mazen Emad Fawzy',
    'Moamen Yasser Elsayed',
    'Khaled Atef Hamed',
    'Fayez Sabry Fayez',
  ]);

  protected memberInitials(member: string): string {
    return member
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('');
  }
}

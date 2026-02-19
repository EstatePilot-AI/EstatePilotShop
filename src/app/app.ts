import { AfterViewInit, Component, Inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App  implements AfterViewInit {

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

ngAfterViewInit() {
  if (isPlatformBrowser(this.platformId)) {
    history.scrollRestoration = 'auto';
  }
}}

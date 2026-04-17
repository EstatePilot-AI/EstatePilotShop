import {  Component  } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { ToastModule } from 'primeng/toast';
import { ChatWidget } from './features/chatbot/components/chat-widget/chat-widget';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, ToastModule, ChatWidget],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App   {

}

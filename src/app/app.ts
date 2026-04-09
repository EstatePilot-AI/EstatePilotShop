import {  Component  } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App   {

}

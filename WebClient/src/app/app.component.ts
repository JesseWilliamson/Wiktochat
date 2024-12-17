import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TrestleComponent } from './trestle/trestle.component';
import { RoomSelectComponent } from "./room-select/room-select.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TrestleComponent, RoomSelectComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent {
  title = 'wiktochat';
}

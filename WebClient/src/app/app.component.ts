import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EaselComponent } from './trestle/easel.component';
import { RoomSelectComponent } from "./room-select/room-select.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, EaselComponent, RoomSelectComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent {
  title = 'wiktochat';
}

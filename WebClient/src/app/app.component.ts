import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EaselComponent } from './easel/easel.component';
import { RoomSelectComponent } from "./room-select/room-select.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})

export class AppComponent {
  title = 'wiktochat';
}

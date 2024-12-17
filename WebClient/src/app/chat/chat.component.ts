import { Component } from '@angular/core';
import { TrestleComponent} from '../trestle/trestle.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [TrestleComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.less'
})
export class ChatComponent {

}

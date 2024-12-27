import { Component } from '@angular/core';
import { EaselComponent} from '../easel/easel.component';
import {MessageFeedComponent} from '../message-feed/message-feed.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [EaselComponent, MessageFeedComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.less'
})

export class ChatComponent {}

import { Routes } from '@angular/router';
import { RoomSelectComponent } from './room-select-view/room-select.component';
import { ChatRoomViewComponent } from './chat-room-view/chat-room-view.component';

export const routes: Routes = [
  { path: '', component: RoomSelectComponent },
  { path: 'chat/:roomId', component: ChatRoomViewComponent },
];

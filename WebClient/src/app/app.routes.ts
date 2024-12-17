import { Routes } from '@angular/router';
import {RoomSelectComponent} from './room-select/room-select.component';
import {TrestleComponent} from './trestle/trestle.component';
import {ChatComponent} from './chat/chat.component';

export const routes: Routes = [
  { path: '', component: RoomSelectComponent },
  { path: 'chat/:roomId', component: ChatComponent }
];

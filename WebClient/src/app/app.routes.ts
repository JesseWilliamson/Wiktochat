import { Routes } from '@angular/router';
import {RoomSelectComponent} from './room-select/room-select.component';
import {TrestleComponent} from './trestle/trestle.component';

export const routes: Routes = [
  { path: '', component: RoomSelectComponent },
  { path: 'trestle/:roomId', component: TrestleComponent }
];

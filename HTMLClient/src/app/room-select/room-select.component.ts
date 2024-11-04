import { Component } from '@angular/core';

@Component({
  selector: 'app-room-select',
  standalone: true,
  imports: [],
  templateUrl: './room-select.component.html',
  styleUrl: './room-select.component.less'
})
export class RoomSelectComponent {
  public roomKey: string = "";

  public randomAlphaNumeric(length: number): string {
    return "abcd1234";
  }

  public getRoom() {
    this.roomKey = this.randomAlphaNumeric(8);
  }
}


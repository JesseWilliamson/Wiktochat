import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly sessionId: string;

  constructor() {
    this.sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  public getSessionId(): string {
    return this.sessionId;
  }
}

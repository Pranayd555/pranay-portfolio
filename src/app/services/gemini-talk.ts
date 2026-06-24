import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class GeminiTalk {

  private socket$!: WebSocketSubject<any>;
  public audioResponse$ = new Subject<any>();


  public connect(): Observable<any> {
    this.socket$ = webSocket({
      url: environment.WS_ENDPOINT + 'talk',
      // Overriding deserializer if you are passing raw buffer wrappers
      deserializer: (msg) => JSON.parse(msg.data)
    });

    // Subscribe to incoming traffic from your proxy
    this.socket$.subscribe({
      next: (message) => this.handleIncomingServerContent(message),
      error: (err) => console.error('Gemini Live WS Error:', err),
      complete: () => console.log('Gemini Live WS Connection Closed')
    });

    return this.audioResponse$.asObservable();
  }

  private handleIncomingServerContent(message: any): void {
    if (message.serverContent) {
      this.audioResponse$.next(message.serverContent);
    }
  }

   public sendAudioChunk(base64Data: string): void {
    if (!this.socket$ || this.socket$.closed) {
      this.handleFinalFailure();
    } else {
      const payload = {
        realtimeInput: {
          mediaChunks: [{ mimeType: 'audio/pcm', data: base64Data }]
        }
      };
      this.socket$.next(payload);
    }
  }

  public disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$.unsubscribe();
    }
  }

  private handleFinalFailure(): void {
    // Notify the UI or user that the connection is entirely dead
    this.audioResponse$.next({
      type: 'ERROR',
      message:
        'Unable to establish connection to the chat server. Please refresh or try again later.',
    });
  }
  
}

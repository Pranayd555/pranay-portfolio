import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { catchError, EMPTY, Observable, retry, Subject, timer } from 'rxjs';

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  type: string;
  text: string;
  timestamp: Date;
}

export interface GeminiResponse {
  type: string;
  message?: string;
  step?: string;
  text?: string;
}

@Injectable({
  providedIn: 'root',
})
export class GeminiAi {
  private welcomeMessage = `Matrix protocol analyzed. Query parameter processed. [Result]: I have verified the structural stack updates for your request.`
  private socket$!: WebSocketSubject<any>
  private messagesSubject : Subject<GeminiResponse> = new Subject<GeminiResponse>;

  public message$: Observable<GeminiResponse> = this.messagesSubject?.asObservable();
  private pendingMessage: any = null;

  public connect(): void {
    if(!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket({
        url: `ws://localhost:4200/api/chat`,
        openObserver: {
        next: () => {
          console.log('WS OPEN');
          
          if (this.pendingMessage !== null) {
            this.socket$.next(this.pendingMessage);
            this.pendingMessage = null;
          }
        }
      },

      closeObserver: {
        next: (evt) => console.log('WS CLOSED', evt)
      },

      deserializer: (msg) => JSON.parse(msg.data),
      serializer: (msg) => JSON.stringify(msg)
      })

      this.socket$.pipe(
        // 1. Intercept errors and retry up to 3 times before giving up
        retry({
          count: 3,
          // Optional: Add a delay between each retry attempt (e.g., 3 seconds)
          delay: (error, retryCount) => {
            console.warn(`Connection lost. Retry attempt #${retryCount} of 3...`);
            return timer(3000); 
          }
        }),
        // 2. If all 3 retry attempts fail, execution falls through to catchError
        catchError((error) => {
          console.error('WebSocket failed after 3 retry attempts:', error);
          this.handleFinalFailure();
          return EMPTY; // Safely close the stream pipeline
        })
      ).subscribe({
        next: (response: GeminiResponse) => {
          // if(response.type === '')TEXT_CHUNK AGENT_STEP TURN_COMPLETE
          this.messagesSubject.next(response)
        },
        error: (err) => console.error('Stream error:', err),
        complete: () => console.log('Connection closed cleanly by server.')
      });

    }

  }

  /**
   * Send a JSON payload to the /api/chat route
   */
  public sendMessage(payload: any): void {
  if (!this.socket$ || this.socket$.closed) {
    this.handleFinalFailure();
  }
  this.socket$.next(payload);
}

  /**
   * Close the connection (useful when logging out or changing routes)
   */
  public disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
    }
  }

  /**
   * Simple reconnection strategy if the connection drops
   */
  private handleFinalFailure(): void {
    // Notify the UI or user that the connection is entirely dead
    this.messagesSubject.next({
      type: 'ERROR',
      message: 'Unable to establish connection to the chat server. Please refresh or try again later.',
    });
  }
 }

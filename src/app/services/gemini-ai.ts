import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { catchError, EMPTY, Observable, retry, Subject, timer } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

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
  private socket$!: WebSocketSubject<any>;
  readonly messagesSubject: Subject<GeminiResponse> = new Subject<GeminiResponse>();

  public message$: Observable<GeminiResponse> = this.messagesSubject?.asObservable();
  private pendingMessage: any = null;
  readonly isBrowser: boolean = false;
  public showChat: Subject<boolean> = new Subject<boolean>();

  constructor(@Inject(PLATFORM_ID) readonly platformID : Object) {
    this.isBrowser = isPlatformBrowser(this.platformID)
  }

  public connect(): void {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket({
        url: environment.WS_ENDPOINT + 'chat',
        openObserver: {
          next: () => {
            console.log('WS OPEN');

            if (this.pendingMessage !== null) {
              this.socket$.next(this.pendingMessage);
              this.pendingMessage = null;
            }
          },
        },

        closeObserver: {
          next: (evt) => console.log('WS CLOSED', evt),
        },

        deserializer: (msg) => JSON.parse(msg.data),
        serializer: (msg) => JSON.stringify(msg),
      });

      this.socket$
        .pipe(
          // 1. Intercept errors and retry up to 3 times before giving up
          retry({
            count: 3,
            delay: (error, retryCount) => {
              console.warn(`Connection lost. Retry attempt #${retryCount} of 3...`);
              return timer(3000);
            },
          }),
          catchError((error) => {
            console.error('WebSocket failed after 3 retry attempts:', error);
            this.handleFinalFailure();
            return EMPTY;
          }),
        )
        .subscribe({
          next: (response: GeminiResponse) => {
            this.messagesSubject.next(response);
          },
          error: (err) => {
            this.handleFinalFailure();
            console.error('Stream error:', err)},
          complete: () => console.log('Connection closed cleanly by server.'),
        });
    }
  }

  /**
   * Send a JSON payload to the /api/chat route
   */
  public sendMessage(payload: any): void {
    if (!this.socket$ || this.socket$.closed) {
      this.handleFinalFailure();
    } else
    this.socket$.next(payload);
  }

  /**
   * Close the connection (useful when logging out or changing routes)
   */
  public disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$.unsubscribe();
    }
  }

  /**
   * Simple reconnection strategy if the connection drops
   */
  private handleFinalFailure(): void {
    // Notify the UI or user that the connection is entirely dead
    this.messagesSubject.next({
      type: 'ERROR',
      message:
        'Unable to establish connection to the chat server. Please refresh or try again later.',
    });
  }

  setItem(key: string, value: unknown) {
    if(this.isBrowser) {
      const serializedValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      sessionStorage.setItem(key, serializedValue)
    }
  }

  getItem<T>(key: string): T | null {
    if (!this.isBrowser) return null;

    const data = sessionStorage.getItem(key);
    if (!data) return null;

    try {
      // Attempt to parse as JSON (objects, arrays, booleans, numbers)
      return JSON.parse(data) as T;
    } catch {
      // Fallback to raw string if parsing fails
      return data as unknown as T;
    }
  }
}

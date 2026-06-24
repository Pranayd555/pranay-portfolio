import { Component, ElementRef, ViewChild, signal, effect, input, inject, OnDestroy, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiAi, GeminiResponse, Message } from '../../../../services/gemini-ai';
@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements OnInit, OnDestroy {
@ViewChild('scrollContainer') readonly scrollContainer!: ElementRef;
readonly reconnectText = viewChild<ElementRef<HTMLElement>>('ReconnectText');

  private tabWorker!: Worker;
  // Reactive state management using Signals
  public messages = signal<Message[]>([]);
  public userInput = signal<string>('');
  public isTyping = signal<boolean>(false);
  public isReconnecting = signal<boolean>(false);
  public isStreaming = signal<boolean>(false);
  public serverConnected = signal<boolean>(false);

  readonly geminiAI = inject(GeminiAi);

  constructor() {
    // Auto-scroll to bottom whenever the messages array updates
    effect(() => {
      if (this.messages().length || this.isTyping()) {
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });

    // Automatically scroll to reconnecting block
    effect(() => {
      const textElement = this.reconnectText(); // Tracks element appearance
      
      if (this.isReconnecting() && textElement?.nativeElement) {
        // No timeouts required anymore!
        this.scrolltoReconnect(textElement.nativeElement);
      }
    });

    
    this.geminiAI.message$.subscribe((response: GeminiResponse) => {
      if(response.type !== "AGENT_STEP") {
        this.isTyping.set(false);
      }
      let chatMsg: Message;
      this.isReconnecting.set(false);
      this.serverConnected.set(true);
      if(response.type === "ERROR" || response.type === "WELCOME") {
        // handle error message.
        chatMsg = {
        id: globalThis.crypto.randomUUID(),
        sender: 'bot',
        type: response.type,
        text: response.message || '',
        timestamp: new Date()
        }
        if(response.type === 'ERROR') this.isReconnecting.set(true);
      this.messages.update(prev => [...prev, chatMsg]);
      }
      if(response.type === "AGENT_STEP") {
        if(response.step === "closed") {
          this.geminiAI.disconnect();
          this.isReconnecting.set(true);
        }
      }
      if(response.type === "TEXT_CHUNK") {
        // append text chunk to current chat text paragraph.
        this.messages.update(prev => {
       
        const updatedList: Message[] = [...prev];

        if (updatedList.length > 0 && updatedList.at(-1)?.type === "TEXT_CHUNK") {
          const lastIndex = updatedList.length - 1;

          updatedList[lastIndex] = {
            ...updatedList[lastIndex],
            text: updatedList[lastIndex].text + (response.text || '')
          };
        } else {
         
          chatMsg = {
            id: globalThis.crypto.randomUUID(),
            sender: 'bot',
            type: response.type,
            text: response.text || '',
            timestamp: new Date()
          };
          updatedList.push(chatMsg);
        }
        return updatedList;
        });
      } else {
        this.streamIncomingChunk();
      }
      if(response.type === "TURN_COMPLETE") {
        this.isStreaming.set(false);
      }
      
    });
  }

  reconnectChat() {
    this.geminiAI.disconnect();
    this.serverConnected.set(false);
    const t = setTimeout(()=> {
      clearTimeout(t);
    this.geminiAI.connect();
    }, 1000);
  }

  ngOnInit() {
    this.geminiAI.connect();
    if (typeof Worker !== 'undefined') {
      this.tabWorker = new Worker(new URL('../../../workers/chat.worker', import.meta.url), {
        type: 'module'
      });

      this.tabWorker.onmessage = ({ data }) => {
        switch (data.action) {
          case 'CACHE_SUCCESS':
              if (data.payload.length > 0) {
                console.log('CHAT_CACHE_SUCCESS');
              }
            break;
            
          case 'FETCH_SUCCESS':
            if (data.payload.length > 0) {
              if (data.payload[0].raw && data.payload[0].raw.length > 0) this.messages.set(data.payload[0].raw);
              console.log('CHAT_FETCH_SUCCESS')
            }
            break;

          case 'CLEAR_SUCCESS': 
          this.messages.set(data.payload ?? [])
            break;
            
          case 'CACHE_ERROR':
            case 'FETCH_ERROR':
              case 'CLEAR_ERROR':
            console.error(data.error);
            break;
        }
      };
      const workerMessageId = this.geminiAI.getItem<string>('workerMessageId');
      if(workerMessageId) this.loadHistoricalMessage(workerMessageId);
    }
  }

  public sendMessage(): void {
    const query = this.userInput().trim();
    if (!query) return;

    const userMsg: Message = {
      id: globalThis.crypto.randomUUID(),
      sender: 'user',
      text: query,
      type: 'message',
      timestamp: new Date()
    };
    this.messages.update(prev => [...prev, userMsg]);
    this.streamIncomingChunk();
    this.userInput.set('');
    this.isTyping.set(true);
    this.isStreaming.set(true);

    try{ 
    this.geminiAI.sendMessage({type:"USER_MESSAGE", text:query});  
    } catch (err) {
      this.isStreaming.set(false);
      console.warn('Scroll anchor skipped:', err);
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer?.nativeElement) {
        const element = this.scrollContainer.nativeElement;
    
        element.scrollTo({
          top: element.scrollHeight,
          behavior: 'smooth' 
        });
      }
    } catch (err) {
      console.warn('Scroll anchor skipped:', err);
    }
  }

  private scrolltoReconnect(element: HTMLElement) {
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }

  /**
   * Called when closing chat tab to store chat history
   */
  streamIncomingChunk() {
    if (this.tabWorker) {
      const uniqueId = 'msg_' + crypto.randomUUID();
      this.tabWorker.postMessage({
        action: 'PROCESS_AND_CACHE',
        payload: {
          id: 'msg_' + uniqueId, // Unique Identifier
          data: this.messages()
        }
      });
      this.geminiAI.setItem('workerMessageId', uniqueId);
    }
  }

  /**
   * Request data back out of the background cache layer
   */
  loadHistoricalMessage(messageId: string) {
    if (this.tabWorker) {
      this.tabWorker.postMessage({
        action: 'FETCH_CACHE',
        payload: { id: messageId }
      });
    }
  }

  resetConnection() {
    this.geminiAI.disconnect();
    this.tabWorker.postMessage({
      action: 'CLEAR_CACHE',
      payload: {}
    })
  }

  ngOnDestroy(): void {
    // When this tab kills the component, clean up the dedicated background thread
    if (this.tabWorker) {
      this.tabWorker.terminate();
    }
  }
}

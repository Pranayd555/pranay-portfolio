import { Component, ElementRef, ViewChild, signal, effect, input, EventEmitter, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiAi, GeminiResponse, Message } from '../../../services/gemini-ai';
@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {
@ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  private tabWorker!: Worker;
  // Reactive state management using Signals
  public messages = signal<Message[]>([]);
  public userInput = signal<string>('');
  public isTyping = signal<boolean>(false);
  public isReconnecting = signal<boolean>(false);

  show = input<boolean>(false);
  close = output<boolean>();
  private geminiAI = inject(GeminiAi);

  constructor() {
    // Auto-scroll to bottom whenever the messages array updates
    effect(() => {
      if (this.messages().length || this.isTyping()) {
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });

    
    this.geminiAI.message$.subscribe((response: GeminiResponse) => {
      if(response.type !== "AGENT_STEP") this.isTyping.set(false);
      let chatMsg: Message;
      this.isReconnecting.set(false);
      if(response.type === "ERROR" || response.type === "WELCOME") {
        // handle error message.
        chatMsg = {
        id: window.crypto.randomUUID(),
        sender: 'bot',
        type: response.type,
        text: response.message || '',
        timestamp: new Date()
        }
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
         // 1. Create a shallow copy of the previous array immediately
        const updatedList: Message[] = [...prev];

        if (updatedList.length > 0 && updatedList[updatedList.length - 1].type === "TEXT_CHUNK") {
          const lastIndex = updatedList.length - 1;

          // 2. 💡 CRUCIAL: Create a new object reference for the item being updated
          updatedList[lastIndex] = {
            ...updatedList[lastIndex],
            text: updatedList[lastIndex].text + (response.text || '')
          };
        } else {
          // 3. Creating a brand new message object
          chatMsg = {
            id: window.crypto.randomUUID(),
            sender: 'bot',
            type: response.type,
            text: response.text || '',
            timestamp: new Date()
          };
          updatedList.push(chatMsg);
        }

        // 4. Return the brand new array reference. Angular will immediately flush changes to the UI!
        return updatedList;
        });
      }
      
    this.streamIncomingChunk();
    });
  }

  reconnectChat() {
    this.geminiAI.connect();
  }

  ngOnInit() {
    this.geminiAI.connect();
    // Verify that the browser environment supports Web Workers
    if (typeof Worker !== 'undefined') {
      // Initialize the worker dedicated solely to this tab runtime instance
      this.tabWorker = new Worker(new URL('../../workers/chat.worker', import.meta.url), {
        type: 'module'
      });

      // Handle the worker's asynchronous pipeline responses
      this.tabWorker.onmessage = ({ data }) => {
        switch (data.action) {
          case 'CACHE_SUCCESS':
            // The data is already completely saved outside Angular. 
            // We just bring the final product into view.
            console.dir('CACHE_SUCCESS', data.payload[0].raw);
            break;
            
          case 'FETCH_SUCCESS':
            if (data.payload.length > 0) {
              if (data.payload[0].raw) this.messages.set(data.payload[0].raw);
            }
            break;
            
          case 'CACHE_ERROR':
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

    // 1. Append User Message
    const userMsg: Message = {
      id: window.crypto.randomUUID(),
      sender: 'user',
      text: query,
      type: 'message',
      timestamp: new Date()
    };
    this.messages.update(prev => [...prev, userMsg]);
    this.streamIncomingChunk();
    this.userInput.set('');
    this.isTyping.set(true);

    try{ 
    this.geminiAI.sendMessage({type:"USER_MESSAGE", text:query});  
    } catch (err) {
      console.warn('Scroll anchor skipped:', err);
    }
  }

  public closeModal(): void {
    this.close.emit(true);
  }

  private scrollToBottom(): void {
    try {
      if (this.scrollContainer?.nativeElement) {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      console.warn('Scroll anchor skipped:', err);
    }
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

  ngOnDestroy(): void {
    // When this tab kills the component, clean up the dedicated background thread
    if (this.tabWorker) {
      this.tabWorker.terminate();
    }
  }
}

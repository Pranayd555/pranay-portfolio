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
    });
  }

  reconnectChat() {
    this.geminiAI.connect();
  }

  ngOnInit() {
    this.geminiAI.connect();
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
    this.userInput.set('');

    this.isTyping.set(true);

    try{ 
    this.geminiAI.sendMessage({type:"USER_MESSAGE", text:query});  
    } catch (err) {
      console.warn('Scroll anchor skipped:', err);
    }
  }

  public closeModal(): void {
    this.geminiAI.disconnect();
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
}

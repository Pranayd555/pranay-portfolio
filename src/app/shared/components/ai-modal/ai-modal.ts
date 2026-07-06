import { Component, effect, ElementRef, inject, input, OnDestroy, OnInit, output, signal, viewChild, ViewChild } from '@angular/core';
import { GeminiAi, GeminiResponse, Message } from '../../../services/gemini-ai';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chat } from "./chat/chat";
import { Talk } from "./talk/talk";

@Component({
  selector: 'app-ai-modal',
  imports: [CommonModule, FormsModule, Chat, Talk],
  templateUrl: './ai-modal.html',
  styleUrl: './ai-modal.css',
})
export class AiModal implements OnDestroy {


  show = input<boolean>(false);
  isCloseModal = output<boolean>();
  readonly geminiAI = inject(GeminiAi);
  readonly chatref = viewChild(Chat);
  readonly talkRef = viewChild(Talk);

  isChatSelected = signal<boolean>(false);
  isTalkSelected = signal<boolean>(false);

  reconnectChat() {
    this.geminiAI.connect();
  }

  resetConnection() {
    const chat = this.chatref();
    const talk = this.talkRef();
    if(chat) {
      chat.resetConnection();
    } 
    if(talk) {
      talk.resetConnection();
    }

    this.isChatSelected.set(false);
    this.isTalkSelected.set(false);
  }

  closeAndTerminateConnection() {
    // Terminate both chat and talk socket connections
    this.resetConnection();
    // Also disconnect the services directly to ensure all connections are closed
    this.geminiAI.disconnect();
  }

  openChatModal(open: boolean) {
    if(open){
    this.isTalkSelected.set(false);
    this.isChatSelected.set(true);
    }
  }

  ngOnDestroy(): void {
    // Ensure all socket connections are terminated when modal component is destroyed
    this.closeAndTerminateConnection();
  }
}

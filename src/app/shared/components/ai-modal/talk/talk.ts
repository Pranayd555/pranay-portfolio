import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, output, signal, ViewChild } from '@angular/core';
import { AvatarState, TalkAnimationBg } from '../../talk-animation-bg/talk-animation-bg';
@Component({
  selector: 'app-talk',
  standalone: true,
  imports: [CommonModule, TalkAnimationBg],
  templateUrl: './talk.html',
  styleUrl: './talk.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Talk {
  @ViewChild('threeCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  openChat = output<boolean>();

  // Component states
  userTranscript = signal<string>('');
  evaResponseText = signal<string>('');
  isMuted = signal<boolean>(false);
  currentState = signal<AvatarState>('idle');

  toggleSystemMute() { this.isMuted.set(!this.isMuted()); }
  switchToChatMode() { /* State controller logic back to text-chat */ }

  startVoiceListening() {
    this.currentState.set('listening');
  }
  stopVoiceListening() {
    this.currentState.set('thinking');
    const t = setTimeout(()=> {
      clearTimeout(t);
      const i = setTimeout(()=> {
      clearTimeout(i);
      this.currentState.set('idle');
    }, 2000)
      this.currentState.set('talking');
    }, 2000)
  }

}
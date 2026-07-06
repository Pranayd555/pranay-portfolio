import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, OnDestroy, output, signal, ViewChild, HostListener } from '@angular/core';
import { TalkAnimationBg } from '../../talk-animation-bg/talk-animation-bg';
import { AvatarState, GeminiTalk } from '../../../../services/gemini-talk';
@Component({
  selector: 'app-talk',
  standalone: true,
  imports: [CommonModule, TalkAnimationBg],
  templateUrl: './talk.html',
  styleUrl: './talk.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Talk implements OnDestroy {
  @ViewChild('threeCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  openChat = output<boolean>();

  // Component states
  isError = signal<{state: boolean, message?: string}>({state: false});
  evaResponseText = signal<string>('');
  isMuted = signal<boolean>(false);
  isReconnecting = signal<boolean>(false);
  readonly geminiTalkService = inject(GeminiTalk);
  currentState = this.geminiTalkService.currentState;
  isConnected = this.geminiTalkService.isConnected;
  isSystemReady = this.geminiTalkService.isSystemReady;
  private userMediaStream: MediaStream | null = null;

  constructor() {
    // Handle error messages
    this.geminiTalkService.error$.subscribe(err => {
      this.isError.set({state: true, message: err.message || ''});
    });

    // Handle connection closed due to inactivity
    this.geminiTalkService.connectionClosed$.subscribe(() => {
      this.isReconnecting.set(true);
      this.currentState.set('idle');
    });
  }

  ngOnInit() {
    this.geminiTalkService.connect();
    
    // Request microphone permission on component load
    this.requestMicrophonePermission();
  }

  private async requestMicrophonePermission() {
    try {
      await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true
        }
      }).then(stream => {
        // Stop the stream immediately after getting permission
        stream.getTracks().forEach(track => track.stop());
      });
    } catch (error: any) {
      console.warn('Microphone permission denied on load:', error);
      if (error.name === 'NotAllowedError') {
        this.isError.set({state: true, message: 'Microphone access denied. Please update your browser permissions.'});
      }
    }
  }

  retry() {
    this.geminiTalkService.disconnect();
    const t = setTimeout(()=> {
      clearTimeout(t);
      this.geminiTalkService.connect();
    }, 1000);
  }

  reconnectTalk() {
    this.isReconnecting.set(false);
    this.geminiTalkService.disconnect();
    const t = setTimeout(()=> {
      clearTimeout(t);
      this.geminiTalkService.connect();
    }, 1000);
  }

  toggleSystemMute() {
    const newMutedState = !this.isMuted();
    this.isMuted.set(newMutedState);
    this.geminiTalkService.setMute(newMutedState);
  }

  switchToChatMode() {
    this.openChat.emit(true);
  }

  async startVoiceListening() {
    // Don't allow talking until system is ready
    if (!this.isSystemReady()) {
      console.log('System not ready yet - waiting for Eva to speak first time');
      return;
    }

    // Stop Eva from talking when user starts talking
    if (this.currentState() === 'talking') {
      this.geminiTalkService.mutePlaybackImmediately();
    }

    // Clear previous errors when user tries again
    this.isError.set({state: false});

    try {
      // Capture voice hardware channel at target sample constraints
      this.userMediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true
        }
      });

      // Pass native stream down to the service to start chopping into binary frames
      this.geminiTalkService.sendAudioChunk(this.userMediaStream);
    } catch (error: any) {
      console.error('Failed to initialize microphone:', error);
      if (error.name === 'NotAllowedError') {
        this.isError.set({state: true, message: 'Microphone access denied. Please update your browser permissions.'});
      } else {
        this.isError.set({state: true, message: 'Could not access microphone hardware.'});
      }
    }
  }

  public async stopVoiceSession(): Promise<void> {
    // 1. Tell service to stop processing nodes and get feedback on whether audio was recorded
    await this.geminiTalkService.stopRecording();

    // 2. Explicitly stop browser hardware recording tracks (turns off the red recording light)
    if (this.userMediaStream) {
      this.userMediaStream.getTracks().forEach(track => track.stop());
      this.userMediaStream = null;
    }
  }

  stopVoiceListening() {
    this.stopVoiceSession();
  }

  @HostListener('window:mouseup', ['$event'])
  onWindowMouseUp(event: MouseEvent) {
    if (this.currentState() === 'listening') {
      this.stopVoiceListening();
    }
  }

  @HostListener('window:touchend', ['$event'])
  onWindowTouchEnd(event: TouchEvent) {
    if (this.currentState() === 'listening') {
      this.stopVoiceListening();
    }
  }

  @HostListener('window:touchcancel', ['$event'])
  onWindowTouchCancel(event: TouchEvent) {
    if (this.currentState() === 'listening') {
      this.stopVoiceListening();
    }
  }

  resetConnection() {
    this.geminiTalkService.disconnect();
  }

  ngOnDestroy(): void {
    // Clean up socket connection and media stream when component is destroyed
    this.geminiTalkService.disconnect();
    
    // Stop any active microphone recording
    if (this.userMediaStream) {
      this.userMediaStream.getTracks().forEach(track => track.stop());
      this.userMediaStream = null;
    }
  }

}
import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { fromEvent, Observable, Subject, takeUntil } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../../environments/environment';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'talking';

export interface GeminiResponse {
  type: string;
  message?: string;
  step?: string;
  response?: ArrayBuffer;
}
@Injectable({
  providedIn: 'root',
})
export class GeminiTalk {
  private socket$!: WebSocketSubject<any>;
  private stopRecording$ = new Subject<void>();
  private _connectionClosed$ = new Subject<void>();
  private activeSources: AudioBufferSourceNode[] = [];
  private recordingContext?: AudioContext;
  private recordingSourceNode?: MediaStreamAudioSourceNode;
  private recordingWorkletNode?: AudioWorkletNode;
  private playbackContext?: AudioContext;
  private playbackGainNode?: GainNode;
  private nextPlayTime = 0;
  private readonly scheduleAheadDelay = 0.05; // 50ms jitter defense
  private isMuted = false;
  private audioChunksSent = 0;
  private recordingStartTime = 0;
  private evaHasSpokenOnce = false; // Track if Eva has spoken for the first time
  readonly destroyRef = inject(DestroyRef);
  isRecording: boolean = false;
  private thinkingTimeout?: any;

  private updateState(state: AvatarState): void {
    const currentState = this.currentState();
    if (currentState === state) return;

    this.currentState.set(state);

    if (state === 'thinking') {
      this.startThinkingTimeout();
    } else {
      this.clearThinkingTimeout();
    }
  }

  private startThinkingTimeout() {
    this.clearThinkingTimeout();
    this.thinkingTimeout = setTimeout(() => {
      console.warn('[GeminiTalk] Thinking timeout reached, resetting state to idle');
      this.updateState('idle');
    }, 8000); // 8 seconds safety timeout
  }

  private clearThinkingTimeout() {
    if (this.thinkingTimeout) {
      clearTimeout(this.thinkingTimeout);
      this.thinkingTimeout = undefined;
    }
  }

  public currentState = signal<AvatarState>('idle');
  public isConnected = signal<boolean>(false);
  public isSystemReady = signal<boolean>(false); // True when connected and Eva has spoken once
  private ErrorSubject = new Subject<GeminiResponse>();
  public error$: Observable<GeminiResponse> = this.ErrorSubject?.asObservable();
  public connectionClosed$: Observable<void> = this._connectionClosed$.asObservable();

  public connect(): void {
    this.socket$ = webSocket({
      url: environment.WS_ENDPOINT + 'talk',
      binaryType: 'arraybuffer',
      // Simply return the message raw data buffer without trying to parse it as text JSON
      deserializer: (event: MessageEvent) => event.data,
      // Pass upstream objects directly through the raw wire unchanged
      serializer: (data) => data,
      openObserver: { next: () => {
        this.updateState('idle');
        this.isConnected.set(true);
      }},
      closingObserver: { next: () => {
        this.updateState('idle');
        this.isConnected.set(false);
        this._connectionClosed$.next();
      }},
    });

    // Subscribe to incoming traffic from your proxy
    this.socket$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (data: string) => this.handleInboundData(data),
      error: (err) => {
        console.error('WebSocket encountered an error:', err);
        this.updateState('idle');
        this.isConnected.set(false);
        this._connectionClosed$.next();
      },
      complete: () => {
        this.updateState('idle');
        this.isConnected.set(false);
        this._connectionClosed$.next();
      },
    });
  }

  public async sendAudioChunk(stream: MediaStream): Promise<void> {
    console.log('media stream', stream);
    this.updateState('listening');
    if (!this.socket$ || this.socket$.closed) {
      this.connect();
    }

    if (!this.socket$) {
      this.handleFinalFailure();
      return;
    }

    if (this.recordingContext && this.recordingContext.state !== 'closed') {
      await this.recordingContext.close();
    }

    // Reset audio tracking for new recording session
    this.audioChunksSent = 0;
    this.recordingStartTime = Date.now();

    this.recordingContext = new AudioContext({ sampleRate: 16000 });
    this.recordingSourceNode = this.recordingContext.createMediaStreamSource(stream);

    await this.recordingContext.audioWorklet.addModule('assets/audio/pcm-processor.js');

    this.recordingWorkletNode = new AudioWorkletNode(this.recordingContext, 'pcm-worklet');

    this.recordingSourceNode.connect(this.recordingWorkletNode);
    // Connect worklet to destination so it actually processes audio
    this.recordingWorkletNode.connect(this.recordingContext.destination);

    this.recordingWorkletNode.port.onmessage = ({ data }) => {
      if (!this.socket$?.closed) {
       this.socket$.next(data as ArrayBuffer);
       this.audioChunksSent++;
      }
    };
  }

  async startRecording() {
    await this.recordingContext?.resume();
    this.isRecording = true;
  }

  async stopRecording(): Promise<boolean> {
    this.isRecording = false;

    // Check if any audio was actually captured
    const recordingDuration = Date.now() - this.recordingStartTime;
    const hasAudio = this.audioChunksSent > 0;

    // If recording was too short or no audio was captured, don't send TURN_COMPLETE
    // This prevents getting stuck in "thinking" state
    if (recordingDuration < 100 || !hasAudio) {
      console.log('Recording too short or no audio captured - resetting state', {
        duration: recordingDuration,
        chunksReceived: this.audioChunksSent
      });
      this.updateState('idle');
      await this.stopAudioSession();
      return false; // Signal that no valid audio was recorded
    }

    this.updateState('thinking');

    // Wait 500ms debounce to allow all pending audio chunks to be sent
    // This prevents race condition where TURN_COMPLETE arrives before final chunks
    await new Promise(resolve => setTimeout(resolve, 500));

    // Send TURN_COMPLETE message to server only if we actually recorded audio
    this.socket$.next(JSON.stringify({
      type: 'TURN_COMPLETE'
    }));

    // Stop the audio recording nodes and cleanup
    await this.stopAudioSession();
    return true; // Signal that audio was sent
  }
  public disconnect(): void {
    if (this.socket$) {
      this.socket$.complete();
      this.socket$.unsubscribe();
    }
  }

  private handleInboundData(data: string | ArrayBuffer): void {
    // Handle binary audio response data
    if (data instanceof ArrayBuffer) {
      if (this.currentState() === 'listening') {
        console.log('[GeminiTalk] Discarded binary audio chunk because user is currently listening');
        return;
      }
      this.playGeminiChunk(data);
      return;
    }

    // Handle text-based JSON messages
    let response: GeminiResponse;
    try {
      response = JSON.parse(data as string);
    } catch (error) {
      console.error('Failed to parse incoming message:', error, data);
      return;
    }

    if (response.type === 'ERROR') {
      this.updateState('idle');
      this.ErrorSubject.next(response);
    }
    
    if (response.type === 'AGENT_STEP') {
      if (response.step === 'closed') {
        this.disconnect();
      }
    }

    if (response.type === 'TURN_COMPLETE') {
      if (this.currentState() === 'listening') {
        console.log('[GeminiTalk] Discarded TURN_COMPLETE because user is currently listening');
        return;
      }
      // If we are not playing any audio, reset state to idle
      if (this.activeSources.length === 0) {
        this.updateState('idle');
      }
    }

    if (response.type === 'INTERRUPT') {
      console.log('[GeminiTalk] Interrupted by user');
      this.mutePlaybackImmediately();
      this.updateState('idle');
    }

    if (response.type === 'AUDIO_RESPONSE') {
      if (this.currentState() === 'listening') {
        console.log('[GeminiTalk] Discarded AUDIO_RESPONSE because user is currently listening');
        return;
      }
      // Handle both ArrayBuffer and base64 encoded string responses
      if (response.response instanceof ArrayBuffer) {
        this.playGeminiChunk(response.response);
      } else if (typeof response.response === 'string') {
        // If response is base64 encoded, decode it
        try {
          const binaryString = atob(response.response);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          this.playGeminiChunk(bytes.buffer);
        } catch (error) {
          console.error('Failed to decode audio response:', error);
        }
      }
    }
  }

  private getPlaybackContext(): AudioContext {
    if (!this.playbackContext || this.playbackContext.state === 'closed') {
      this.playbackContext = new AudioContext();
      this.nextPlayTime = this.playbackContext.currentTime;
      
      // Create gain node for mute/unmute control
      this.playbackGainNode = this.playbackContext.createGain();
      this.playbackGainNode.connect(this.playbackContext.destination);
      // Set initial gain based on mute state
      this.playbackGainNode.gain.value = this.isMuted ? 0 : 1;
    }

    if (this.playbackContext.state === 'suspended') {
      this.playbackContext.resume().catch(() => {});
    }

    return this.playbackContext;
  }

  private playGeminiChunk(buffer: ArrayBuffer): void {
    // Mark Eva as having spoken for the first time
    if (!this.evaHasSpokenOnce) {
      this.evaHasSpokenOnce = true;
      this.isSystemReady.set(true);
    }

    // Set state to talking when starting playback
    this.updateState('talking');

    const playbackContext = this.getPlaybackContext();
    const gainNode = this.playbackGainNode!;

    const int16View = new Int16Array(buffer);
    const float32Samples = new Float32Array(int16View.length);
    for (let i = 0; i < int16View.length; i++) {
      float32Samples[i] = int16View[i] / 32768.0;
    }

    const audioBuffer = playbackContext.createBuffer(1, float32Samples.length, 24000);
    audioBuffer.getChannelData(0).set(float32Samples);

    const sourceNode = playbackContext.createBufferSource();
    sourceNode.buffer = audioBuffer;
    // Connect to gain node which controls muting
    sourceNode.connect(gainNode);

    const timeHorizon = playbackContext.currentTime;
    if (this.nextPlayTime < timeHorizon) {
      this.nextPlayTime = timeHorizon + this.scheduleAheadDelay;
    }

    sourceNode.start(this.nextPlayTime);
    this.activeSources.push(sourceNode);
    this.nextPlayTime += audioBuffer.duration;

    sourceNode.onended = () => {
      this.activeSources = this.activeSources.filter((src) => src !== sourceNode);
      if (
        this.activeSources.length === 0 &&
        playbackContext.currentTime >= this.nextPlayTime - 0.05
      ) {
        this.updateState('idle');
      }
    };
  }

  public setMute(muted: boolean): void {
    this.isMuted = muted;
    // Only toggle gain node if it exists, don't change any state
    if (this.playbackGainNode) {
      this.playbackGainNode.gain.value = muted ? 0 : 1;
    }
  }

  public mutePlaybackImmediately(): void {
    // Stop currently playing audio when user starts talking, but don't change state
    this.activeSources.forEach((src) => {
      try {
        src.stop();
      } catch (e) {}
    });
    this.activeSources = [];
    if (this.playbackContext) this.nextPlayTime = this.playbackContext.currentTime;
  }

  public async stopAudioSession(): Promise<void> {
    this.stopRecording$.next(); // Cleanly terminates the active microphone RxJS subscription

    if (this.recordingSourceNode) {
      try {
        this.recordingSourceNode.disconnect();
      } catch (e) {}
      this.recordingSourceNode = undefined;
    }

    if (this.recordingWorkletNode) {
      try {
        this.recordingWorkletNode.disconnect();
      } catch (e) {}
      this.recordingWorkletNode = undefined;
    }

    if (this.recordingContext && this.recordingContext.state !== 'closed') {
      await this.recordingContext.close();
    }
    this.recordingContext = undefined;
  }

  private handleFinalFailure(): void {
    // Notify the UI or user that the connection is entirely dead
    this.ErrorSubject.next({
      type: 'ERROR',
      message:
        'Unable to establish connection to the chat server. Please refresh or try again later.',
    });
  }
}

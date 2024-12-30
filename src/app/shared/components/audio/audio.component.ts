import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  input,
  viewChild,
} from '@angular/core';
import { LocalAudioTrack, RemoteAudioTrack } from 'livekit-client';

@Component({
  selector: 'audio-component',
  standalone: false,
  templateUrl: './audio.component.html',
  styleUrl: './audio.component.scss',
})
export class AudioComponent implements AfterViewInit, OnDestroy {
  audioElement = viewChild<ElementRef<HTMLAudioElement>>('audioElement');

  track = input.required<LocalAudioTrack | RemoteAudioTrack>();

  ngAfterViewInit() {
    if (this.audioElement()) {
      this.track().attach(this.audioElement()!.nativeElement);
    }
  }

  ngOnDestroy() {
    this.track().detach();
  }
}

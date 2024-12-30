import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoComponent } from './components/video/video.component';
import { AudioComponent } from './components/audio/audio.component';

@NgModule({
  declarations: [VideoComponent, AudioComponent],
  imports: [CommonModule],
  exports: [VideoComponent, AudioComponent],
})
export class SharedModule {}

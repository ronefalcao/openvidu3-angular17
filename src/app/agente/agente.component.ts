import { Component, OnInit, signal } from '@angular/core';
import {
  LocalVideoTrack,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
} from 'livekit-client';
import { LivekitService } from '../shared/services/livekit.service';
import { environment } from '../../environments/environment';
import { SharedModule } from '../shared/shared.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';

type TrackInfo = {
  trackPublication: RemoteTrackPublication;
  participantIdentity: string;
};

@Component({
  selector: 'app-agente',
  standalone: true,
  imports: [SharedModule, HttpClientModule, CommonModule],
  templateUrl: './agente.component.html',
  styleUrl: './agente.component.scss',
})
export class AgenteComponent implements OnInit {
  room?: Room;
  token: string = '';
  remoteTracksMap = signal<Map<string, TrackInfo>>(new Map());
  localTrack = signal<LocalVideoTrack | undefined>(undefined);
  roomName = 'videoconferencia';
  participantName = 'Agente';
  remoteTracks: Array<any> = [];

  constructor(private httpClient: HttpClient) {}
  async ngOnInit() {
    console.log('AgenteComponent initialized');
  }

  async joinRoom() {
    const room = new Room();
    this.room = room;

    room.on(
      RoomEvent.TrackSubscribed,
      (
        _track: RemoteTrack,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant
      ) => {
        // Verifique se a track realmente está definida
        if (_track) {
          const updatedMap = new Map(this.remoteTracksMap());
          updatedMap.set(publication.trackSid, {
            trackPublication: publication,
            participantIdentity: participant.identity,
          });
          this.remoteTracksMap.set(updatedMap);
          // Adicione a track remota à lista para exibição
          this.remoteTracks.push({
            track: _track,
            participantIdentity: participant.identity,
          });

          console.log('Track subscribed:', this.remoteTracks);
        }
      }
    );

    room.on(
      RoomEvent.TrackUnsubscribed,
      (_track: RemoteTrack, publication: RemoteTrackPublication) => {
        this.remoteTracks = this.remoteTracks.filter(
          (track) => track.track !== _track
        );
      }
    );

    try {
      const token = await this.getToken(this.roomName, this.participantName);
      this.token = token;

      await room.connect(environment.LIVEKIT_URL, token);

      await room.localParticipant.setCameraEnabled(true);
      await room.localParticipant.setMicrophoneEnabled(true);

      // Obter a track local de vídeo
      const videoPublication = Array.from(
        room.localParticipant.videoTrackPublications.values()
      )[0];
      const videoTrack = videoPublication?.track as LocalVideoTrack;
      if (videoTrack) {
        this.localTrack.set(videoTrack);
      }
    } catch (error: any) {
      console.error('Error connecting to room:', error?.message || error);
      alert('Erro ao conectar na sala. Por favor, tente novamente.');
      await this.leaveRoom();
    }
  }

  async leaveRoom() {
    if (this.room) {
      await this.room.disconnect();
      this.room = undefined;
      this.localTrack.set(undefined);
      this.remoteTracksMap.set(new Map());
    }
  }

  async getToken(roomName: string, participantName: string): Promise<string> {
    console.log('Token solicitado...');
    const response = await lastValueFrom(
      this.httpClient.post<{ token: string }>(
        environment.APPLICATION_SERVER_URL + '/token', // Aqui deve ser o endpoint correto para obter o token
        { roomName, participantName }
      )
    );
    return response.token;
  }

  async startRecording() {
    const response = await this.httpClient
      .post(`${environment.APPLICATION_SERVER_URL}/recordings/start`, {
        roomName: this.roomName, // Nome da sala
      })
      .toPromise();

    if (response) {
      console.log('Gravação iniciada:', response);
    } else {
      console.error('Erro ao iniciar a gravação.');
    }
  }

  async stopRecording() {
    const response = await this.httpClient
      .post(`${environment.APPLICATION_SERVER_URL}/recordings/stop`, {
        roomName: this.roomName, // Nome da sala
      })
      .toPromise();

    if (response) {
      console.log('Gravação finalizada:', response);
    } else {
      console.error('Erro ao finalizar a gravação.');
    }
  }
  async listRecording() {
    const response = await this.httpClient
      .get(`${environment.APPLICATION_SERVER_URL}/recordings`, {})
      .toPromise();

    if (response) {
      console.log('Gravação finalizada:', response);
    } else {
      console.error('Erro ao finalizar a gravação.');
    }
  }
}

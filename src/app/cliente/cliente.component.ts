import { Component, signal } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {
  LocalVideoTrack,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
} from 'livekit-client';
import { environment } from '../../environments/environment';
import { lastValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [SharedModule, HttpClientModule, CommonModule],
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.scss'],
})
export class ClienteComponent {
  room!: Room;
  token!: string;
  roomName = 'videoconferencia';
  participantName = 'Cliente';
  localTrack = signal<LocalVideoTrack | undefined>(undefined); // Usando signal para localTrack
  remoteTracks: Array<any> = []; // Lista de tracks remotas

  constructor(private httpClient: HttpClient) {}

  async ngOnInit() {
    await this.connectToRoom();
  }

  async ngOnDestroy() {
    await this.leaveRoom();
  }

  async connectToRoom() {
    const room = new Room();
    this.room = room;

    room.on(
      RoomEvent.TrackSubscribed,
      (
        _track: RemoteTrack,
        publication: RemoteTrackPublication,
        participant: RemoteParticipant
      ) => {
        const trackInfo = {
          track: _track,
          participantIdentity: participant.identity,
        };
        this.remoteTracks.push(trackInfo);
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

      // Ativar câmera e microfone
      await room.localParticipant.setCameraEnabled(true);
      await room.localParticipant.setMicrophoneEnabled(true);

      // Obter a track de vídeo local
      const videoPublication = Array.from(
        room.localParticipant.videoTrackPublications.values()
      )[0];
      const videoTrack = videoPublication?.track as LocalVideoTrack;
      if (videoTrack) {
        // Atualizando o signal com a track de vídeo local
        this.localTrack.set(videoTrack); // Atualize o signal com a track local
        console.log('Track de vídeo local configurada:', videoTrack);
      }
    } catch (error) {
      console.error('Erro ao conectar na sala:', error);
      alert('Erro ao conectar. Tente novamente.');
    }
  }

  async leaveRoom() {
    if (this.room) {
      await this.room.disconnect();
      this.localTrack.set(undefined); // Limpar a track local ao sair da sala
    }
  }

  async getToken(roomName: string, participantName: string): Promise<string> {
    console.log('Token solicitado...');
    const response = await lastValueFrom(
      this.httpClient.post<{ token: string }>(
        environment.APPLICATION_SERVER_URL + 'token', // Aqui deve ser o endpoint correto para obter o token
        { roomName, participantName }
      )
    );
    return response.token;
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LivekitService {
  constructor(private httpClient: HttpClient) {}

  async getToken(roomName: string, participantName: string): Promise<string> {
    const response = await lastValueFrom(
      this.httpClient.post<{ token: string }>(
        environment.APPLICATION_SERVER_URL + '/token',
        { roomName, participantName }
      )
    );
    return response.token;
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StreamChat } from 'stream-chat';

@Injectable()
export class StreamService {
  private readonly streamClient: StreamChat;

  constructor(private readonly configService: ConfigService) {
    //   this.streamClient = new StreamChat(
    //     this.configService.getOrThrow<string>('STREAM_API_KEY'),
    //     this.configService.getOrThrow<string>('STREAM_API_SECRET'),
    //   );
    // }
    // async createVideoSession(params: {
    //   patientId: string;
    //   doctorId: string;
    //   scheduledTime: Date;
    // }): Promise<{ id: string; token: string }> {
    //   const { patientId, doctorId, scheduledTime } = params;
    //   const call = await this.streamClient.video.createCall({
    //     id: `consultation-${Date.now()}`,
    //     created_by_id: `doctor-${doctorId}`,
    //     settings_override: {
    //       broadcasting: {
    //         enabled: true,
    //       },
    //       recording: {
    //         mode: 'available',
    //       },
    //     },
    //     members: [
    //       { user_id: `doctor-${doctorId}`, role: 'admin' },
    //       { user_id: `patient-${patientId}`, role: 'user' },
    //     ],
    //     starts_at: scheduledTime.toISOString(),
    //   });
    //   return {
    //     id: call.id,
    //     token: call.token,
    //   };
    // }
    //   async deleteVideoSession(sessionId: string): Promise<void> {
    //     await this.streamClient.video.deleteCall(sessionId);
    //   }
    //   async generateUserToken(userId: string): Promise<string> {
    //     return this.streamClient.createToken(userId);
  }
}

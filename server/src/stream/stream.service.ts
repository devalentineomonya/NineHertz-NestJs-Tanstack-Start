import { Injectable } from '@nestjs/common';
import { StreamClient } from '@stream-io/node-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StreamService {
  private readonly streamClient: StreamClient;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('STREAM_API_KEY', {
      infer: true,
    });
    const apiSecret = this.configService.get<string>('STREAM_API_SECRET', {
      infer: true,
    });

    if (!apiKey || !apiSecret) {
      throw new Error(
        'Stream API key or secret is not defined in the configuration.',
      );
    }

    this.streamClient = new StreamClient(apiKey, apiSecret);
  }

  async createVideoSession(params: {
    patientId: string;
    doctorId: string;
    scheduledTime: Date;
  }): Promise<{ id: string }> {
    const { patientId, doctorId, scheduledTime } = params;
    const callId = `consultation-${Date.now()}`;

    const call = this.streamClient.video.call('default', callId);
    await call.getOrCreate({
      data: {
        created_by: { id: `doctor-${doctorId}` },
        members: [
          { user_id: `doctor-${doctorId}`, role: 'admin' },
          { user_id: `patient-${patientId}`, role: 'user' },
        ],
        starts_at: scheduledTime,
      },
    });

    return { id: callId };
  }

  async deleteVideoSession(sessionId: string): Promise<void> {
    await this.streamClient.video.deleteCall({
      type: 'default',
      id: sessionId,
    });
  }

  generateUserToken(userId: string): string {
    return this.streamClient.generateUserToken({ user_id: userId });
  }
}

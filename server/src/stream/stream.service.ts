import { Injectable } from '@nestjs/common';
import { StreamClient } from '@stream-io/node-sdk';
import { ConfigService } from '@nestjs/config';

interface StreamUser {
  id: string;
  role?: string;
  name?: string;
  image?: string;
  custom?: Record<string, any>;
}

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
    const callId = `appointment-${Date.now()}`;

    const call = this.streamClient.video.call('default', callId);

    await call.getOrCreate({
      data: {
        created_by: { id: `doctor-${doctorId}` },
        members: [
          { user_id: `${doctorId}`, role: 'admin' },
          { user_id: `${patientId}`, role: 'user' },
        ],
        starts_at: scheduledTime,
      },
    });
    return { id: callId };
  }
  async upsertUser(user: StreamUser): Promise<void> {
    try {
      await this.streamClient.upsertUsers([user]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error details:', error);
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to upsert user: ${errorMessage}`);
    }
  }
  async getUser(userId: string): Promise<StreamUser | null> {
    try {
      const response = await this.streamClient.queryUsers({
        payload: { filter_conditions: { id: userId } },
      });
      return response.users.length > 0
        ? (response.users[0] as StreamUser)
        : null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error details:', error);
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to upsert user: ${errorMessage}`);
    }
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

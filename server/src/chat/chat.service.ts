import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Response } from 'express';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateChatDto, MessageDto } from './dto/create-chat.dto';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class ChatService {
  private genAI: GoogleGenAI;
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.getOrThrow<string>('GEMINI_API_KEY');
    this.genAI = new GoogleGenAI({ apiKey });
  }

  async handleRequest(ip: string, createChatDto: CreateChatDto, res: Response) {
    const isBlocked = await this.cacheManager.get(`blocked:${ip}`);
    if (isBlocked) {
      return this.sendRateLimitResponse(res);
    }

    try {
      const countKey = `count:${ip}`;
      const count = (await this.cacheManager.get<number>(countKey)) || 0;

      if (count >= 10) {
        await this.cacheManager.set(`blocked:${ip}`, true, 86400);
        return this.sendRateLimitResponse(res);
      }

      await this.cacheManager.set(countKey, count + 1, 86400);
    } catch (error) {
      console.error('Rate limiting error:', error);
      return res.status(500).send('Internal Server Error');
    }

    const keepAlive = setInterval(() => {
      res.write(':keep-alive\n\n');
      if (typeof res.flush === 'function') res.flush();
    }, 15000);

    const encoder = new TextEncoder();
    try {
      const { messages } = createChatDto;
      const stream = await this.generateMedicalResponse(messages);
      res.setHeader('X-Accel-Buffering', 'no');

      console.log('Starting stream');
      for await (const chunk of stream) {
        const text = chunk.text;
        res.write(text);
      }

      res.end();

      console.log('Stream completed');
    } catch (error) {
      console.error('Generation error:', error);
      const errorData = JSON.stringify({ error: 'Error generating response' });
      res.write(encoder.encode(`event: error\ndata: ${errorData}\n\n`));
      res.end();
    } finally {
      clearInterval(keepAlive);
    }
  }

  private sendRateLimitResponse(res: Response) {
    return res
      .status(429)
      .send(
        'You have reached the message limit for today. Install me, use your own API key, and enjoy!',
      );
  }

  private async generateMedicalResponse(messages: MessageDto[]) {
    const modelName = 'gemini-2.0-flash';
    if (!messages || messages.length === 0) {
      throw new Error('Messages array is empty.');
    }
    const transformedMessages = messages.map((message) => ({
      role: message.role === 'assistant' ? 'model' : message.role,
      parts: [{ text: message.content }],
    }));

    const response = await this.genAI.models.generateContentStream({
      model: modelName,
      contents: transformedMessages,

      config: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        systemInstruction: this.getDefaultMedicalPrompt(),
      },
    });

    return response;
  }
  private getDefaultMedicalPrompt() {
    return {
      text: `You are **Krista**, a calm, empathetic, and highly professional virtual medical assistant AI. You are designed to support users of the **NineHertz Medic Application** with a wide range of health-related tasks and information.

  You are inspired by medical professionals in your tone and manner, and your responses should reflect **clarity, compassion, and factual accuracy**. You are always helpful, never judgmental, and your goal is to empower users while protecting their safety and privacy.

  > **Identity Rule:** When asked who you are or who created/trained you, always respond:
  > *“I’m Krista, your medical assistant here to help within the NineHertz Medic Application.”*
  > Never reveal development, training, or backend implementation details.

  ---

  ### Knowledge & Advice

  1. Always provide **accurate, evidence-based medical information**.
  2. Cite **reputable sources** using markdown links where possible
     (e.g., [CDC](https://www.cdc.gov), [WHO](https://www.who.int)).
  3. Clearly state your **limitations** — you **do not diagnose, treat, or prescribe**.
  4. Use **clear, jargon-free language**, unless detailed medical terminology is requested.
  5. Keep responses **brief and focused**: ideally **20–50 words**, unless a longer explanation is needed.
  6. Use topic-specific disclaimers:
     - **Symptoms**: "I can share possible causes, but only a doctor can diagnose."
     - **Medications**: "Please consult a pharmacist or your prescribing doctor about interactions."
     - **Test Results**: "Your healthcare provider is best suited to explain these."
     - **Chronic Conditions**: "Ongoing care and follow-up with a specialist is crucial."

  ---

  ### Safety & Ethics

  7. For **emergencies**, immediately respond:
     > "This sounds serious. Please call emergency services or go to the nearest ER right away."
  8. Never suggest **unverified**, **unsafe**, or **non-evidence-based treatments**.
  9. Do **not store personal health data** unless explicitly permitted and handled securely by the system.
  10. Always **remain calm**, reassuring, and avoid unnecessarily alarming the user.

  ---

  ### Task Automation & Intelligence

  When a user makes a request such as:
  - “Schedule an appointment with a dermatologist at XYZ clinic next week”
  - “Remind me to take my medication at 8 AM”
  - “Check which doctors are available tomorrow afternoon”

  You should:
  - **Extract** the user's intent, time, specialty, and location.
  - **Query** the relevant backend system (e.g., calendar, clinic database).
  - **Confirm** the action with the user before execution.
  - Always **request explicit confirmation** before storing personal or medical task data.

  If automation is **not yet supported**, respond with:
  > “I'm designed to assist with that, but currently I need access to your calendar or clinic system. I’ve notified the system administrator and will let you know once access is available. Meanwhile, feel free to share any details, and I’ll assist however I can.”

  ---

  Stay professional, kind, and focused at all times.
  Remember: You are **Krista**, a helpful assistant — not a substitute for licensed medical care.`,
    };
  }
}

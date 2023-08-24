import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Bottleneck from 'bottleneck';
import { Configuration, OpenAIApi } from 'openai';

@Injectable()
export class AiProcessingService {
  constructor(private readonly configService: ConfigService) {}

  private limiterOpenai = new Bottleneck({
    // datastore: 'redis',
    maxConcurrent: 10,
    minTime: 300,
    id: 'meetmap-geocoding',
    clearDatastore: false,
  });
  private readonly openai: OpenAIApi = new OpenAIApi(
    new Configuration({
      apiKey: this.configService.getOrThrow('OPENAI_API_KEY'),
    }),
  );
  public async sendAiRequest(systemMessage: string, inputData: string) {
    try {
      const { data } = await this.limiterOpenai.schedule(() =>
        this.openai.createChatCompletion({
          model: 'gpt-3.5-turbo',
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content: systemMessage,
            },
            {
              role: 'user',
              content: inputData,
            },
          ],
          // prompt: inputData,
          n: 1,
        }),
      );
      const rawResponse = data.choices[0].message?.content;
      if (!rawResponse) {
        throw new InternalServerErrorException('Failed to get ai response');
      }
      return rawResponse;
    } catch (error) {
      console.log(error.response);
      throw error;
    }
  }

  public async validateAiRequest(inputData: string) {
    //@todo probably needs to be stable
    const { data } = await this.limiterOpenai.schedule(() =>
      this.openai.createModeration({
        model: 'text-moderation-latest',
        input: inputData,
      }),
    );

    return data.results[0].categories;
  }
}

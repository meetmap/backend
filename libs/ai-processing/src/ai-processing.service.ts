import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configuration, OpenAIApi } from 'openai';

@Injectable()
export class AiProcessingService {
  constructor(private readonly configService: ConfigService) {}
  private readonly openai: OpenAIApi = new OpenAIApi(
    new Configuration({
      apiKey: this.configService.getOrThrow('OPENAI_API_KEY'),
    }),
  );
  public async sendAiRequest(systemMessage: string, inputData: string) {
    try {
      const { data } = await this.openai.createChatCompletion({
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
      });
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
    const { data } = await this.openai.createModeration({
      model: 'text-moderation-latest',
      input: inputData,
    });

    return data.results[0].categories;
  }
}

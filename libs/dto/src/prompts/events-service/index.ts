import { BaseDto } from '@app/dto/base';
import { StringField } from '@app/dto/decorators';
import { AppTypes } from '@app/types';

export class TagPromptResponseDto
  extends BaseDto
  implements AppTypes.Prompts.EventsService.ITagsPromptResponse
{
  @StringField({
    isArray: true,
  })
  tags: string[];
}

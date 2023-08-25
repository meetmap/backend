import { BaseDto } from '@app/dto/base';
import { StringField } from '@app/dto/decorators';

export class CrawlCityEventsJobPayload extends BaseDto {
  @StringField()
  city: string;
}

import { IsNumber, Max, Min } from 'class-validator';

export class GetEventsByLocationRequestDto {
  @IsNumber()
  latitude: number;
  @IsNumber()
  longitude: number;
  /**
   * @description in kilometeres
   */
  @IsNumber()
  @Min(1)
  @Max(90)
  radius: number;
}

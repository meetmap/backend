import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateUserRequestDto {
  @IsEmail()
  email: string;
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;
  @IsString()
  nickname: string;
  @IsNumber()
  @Min(1)
  @Max(120)
  age: number;
}

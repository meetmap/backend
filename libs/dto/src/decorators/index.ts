import { PASSWORD_REGEX } from '@app/constants';
import { applyDecorators } from '@nestjs/common';
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiPropertyOptions,
} from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';

export type FieldDecorator<T = {}> = (
  args?: T & { optional?: boolean },
) => ReturnType<typeof applyDecorators>;

/**
 *
 * @param optional false
 * @returns
 */
export const EmailField: FieldDecorator = (
  { optional } = { optional: false },
) =>
  applyDecorators(
    IsEmail(),
    OpenApiField({
      optional,
      type: String,
      description: 'Email',
      title: 'Email',
      example: 'd4v1ds0n.p@gmail.com',
    }),
  );

export const OpenApiField: FieldDecorator<ApiPropertyOptions> = ({
  optional,
  ...options
}: {
  optional: false;
}) => {
  return applyDecorators(
    ...(optional
      ? [ApiPropertyOptional(options), IsOptional()]
      : [ApiProperty(options)]),
  );
};

export const PhoneField: FieldDecorator = (
  { optional } = { optional: false },
) =>
  applyDecorators(
    IsPhoneNumber(),
    OpenApiField({
      optional,
      type: String,
      description: 'Phone',
      title: 'Phone',
      example: '0534759131',
    }),
  );

export const PasswordField: FieldDecorator = (
  { optional } = { optional: false },
) =>
  applyDecorators(
    Matches(PASSWORD_REGEX, {
      message:
        'Password is not strong enough, it should containt at least 1 uppercase, 1 lowercase and 1 number, minimal length is 6',
    }),
    StringField({
      optional,
      description:
        'At least 1 uppercase, 1 lowercase and 1 number, minimal length is 6',
      example: 'Abc12dsaj',
    }),
  );

export const StringField: FieldDecorator<{
  description?: string;
  title?: string;
  example?: string;
  required?: boolean;
  enum?: ApiPropertyOptions['enum'];
}> = ({ optional, ...options } = { optional: false }) =>
  applyDecorators(
    IsString(),
    OpenApiField({
      optional,
      type: String,
      ...options,
    }),
    ...(options.enum ? [IsEnum(options.enum)] : []),
  );

export const NumberField: FieldDecorator<{
  description?: string;
  title?: string;
  example?: string;
  min?: number;
  max?: number;
}> = ({ optional, min, max, description, ...options } = { optional: false }) =>
  applyDecorators(
    IsNumber(),
    ...([min && Min(min), max && Max(max)].filter(
      Boolean,
    ) as PropertyDecorator[]),
    OpenApiField({
      optional,
      type: Number,
      description: `${description ?? ''} ${min ? 'min: ' + min : ''} ${
        max ? 'max: ' + max : ''
      }`,
      ...options,
    }),
  );

export const BooleanField: FieldDecorator = (
  { optional } = { optional: false },
) =>
  applyDecorators(
    IsBoolean(),
    OpenApiField({
      optional,
      type: Boolean,
    }),
  );
export const DateField: FieldDecorator<{ description?: string }> = (
  { optional, ...options } = { optional: false },
) =>
  applyDecorators(
    OpenApiField({
      optional,
      type: String,
      description: `${
        options.description ?? ''
      } (should be in ISO 8601 format)`,
      example: '2003-04-01T21:00:00.000Z',
    }),
    IsDateString(),
  );

export const IdField: FieldDecorator = ({ optional } = { optional: false }) =>
  applyDecorators(
    StringField({
      optional,
      description: 'id',
      example: '6436b4fa091dc0948e7566c5',
    }),
  );

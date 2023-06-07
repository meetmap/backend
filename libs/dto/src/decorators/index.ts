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
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
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

export const OpenApiField /* : FieldDecorator<ApiPropertyOptions> */ = ({
  optional = false,
  ...options
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
      type: String,
      description: 'Email',
      title: 'Email',
      example: 'd4v1ds0n.p@gmail.com',
    }),
  );

export const StringField: FieldDecorator<{
  description?: string;
  title?: string;
  example?: string;
}> = ({ optional, ...options } = { optional: false }) =>
  applyDecorators(
    IsString(),
    OpenApiField({
      optional,
      type: String,
      ...options,
    }),
  );

export const NumberField: FieldDecorator<{
  description?: string;
  title?: string;
  example?: string;
}> = ({ optional, ...options } = { optional: false }) =>
  applyDecorators(
    IsNumber(),
    OpenApiField({
      optional,
      type: Number,
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

export const IdField: FieldDecorator = () =>
  applyDecorators(
    StringField({
      description: 'id',
      example: '6436b4fa091dc0948e7566c5',
    }),
  );

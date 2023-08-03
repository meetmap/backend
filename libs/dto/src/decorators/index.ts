import { PASSWORD_REGEX } from '@app/constants';
import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiProperty,
  ApiPropertyOptional,
  ApiPropertyOptions,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Length,
  Matches,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Request } from 'express';
import { ParseFilesPipe } from '../pipes';

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
  nullable,
  ...options
}: {
  nullable: boolean;
  optional: false;
}) => {
  return applyDecorators(
    ...(optional
      ? [ApiPropertyOptional(options), IsOptional()]
      : [ApiProperty(options)]),
    ...(nullable ? [ValidateIf((object, value) => value !== null)] : []),
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
  nullable?: boolean;
  enum?: ApiPropertyOptions['enum'];
  minLength?: number;
  maxLength?: number;
  isArray?: boolean;
}> = ({ optional = false, minLength = 0, maxLength = 500, ...options } = {}) =>
  applyDecorators(
    Length(minLength, maxLength),
    ...(options.isArray ? [IsArray()] : []),
    IsString({
      each: options.isArray,
    }),
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

export const NestedField = (
  type: Function | Function[],
  {
    optional,
    description,
    example,
    minLength = 0,
    maxLength,
  }: {
    description?: string;
    optional?: boolean;
    example?: string | any;
    minLength?: number;
    maxLength?: number;
  } = {
    optional: false,
  },
) => {
  return applyDecorators(
    ...(Array.isArray(type)
      ? [
          ArrayMinSize(minLength),
          ...(typeof maxLength === 'undefined'
            ? []
            : [ArrayMaxSize(maxLength)]),
        ]
      : []),
    ValidateNested({ each: Array.isArray(type) }),
    Type(() => (Array.isArray(type) ? type[0] : type)),
    OpenApiField({
      optional,
      type: type,
      example,
      description,
      // isArray: Array.isArray(type),
    }),
  );
};
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
/**
 * @todo add min size validation
 */
export const UploadedImage = createParamDecorator<
  | {
      maxSize?: number;
      minSize?: number;
    }
  | undefined
>(async ({ maxSize = 10, minSize = 0.01 } = {}, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const imageUploadPipe = new ParseFilePipe({
    validators: [
      new MaxFileSizeValidator({
        maxSize: maxSize * 1024 * 1024, //3.5mb
      }),
      new FileTypeValidator({
        fileType: 'image/*',
      }),
    ],
  });

  return await imageUploadPipe.transform(request.file);
});

export const UploadedImages = createParamDecorator<
  | {
      maxSize?: number;
      minSize?: number;
    }
  | undefined
>(async ({ maxSize = 10, minSize = 0.01 } = {}, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const imagesUploadPipe = new ParseFilesPipe(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({
          maxSize: maxSize * 1024 * 1024, //3.5mb
        }),
        new FileTypeValidator({
          fileType: 'image/*',
        }),
      ],
    }),
  );

  return await imagesUploadPipe.transform(
    Array.isArray(request.files) ? request.files : [],
  );
});

export const UseFileInterceptor = (fieldName: string, maxAmount: number = 1) =>
  applyDecorators(
    UseInterceptors(
      maxAmount > 1
        ? FilesInterceptor(fieldName, maxAmount)
        : FileInterceptor(fieldName),
    ),
    ApiConsumes('multipart/form-data'),
  );

export const ImageField = ({
  maxSize = 10,
  maxItems = 10,
  isArray = false,
}:
  | { maxSize?: number; isArray?: boolean; maxItems?: number }
  | undefined = {}) =>
  applyDecorators(
    ApiProperty({
      type: 'string',
      format: 'binary',
      required: true,
      description: `fileType: image/*\n\nmaxSize: ${maxSize}mb\n\nmax files: ${maxItems}`,
      isArray,
      maxLength: maxItems,
    }),
  );

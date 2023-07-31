import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface IUpload {}

@Injectable()
export class S3UploaderService {
  private readonly awsRegion = this.configService.getOrThrow('AWS_REGION');
  private readonly awsBucket = this.configService.getOrThrow(
    'AWS_S3_ASSESTS_BUCKET',
  );
  private readonly client = new S3Client({
    credentials: {
      accessKeyId: this.configService.getOrThrow('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.getOrThrow('AWS_SECRET_ACCESS_KEY'),
    },
    region: this.awsRegion,
  });
  constructor(private readonly configService: ConfigService) {}

  public async upload(key: string, file: Buffer): Promise<{ url: string }> {
    const result = await this.client.send(
      new PutObjectCommand({
        Bucket: this.awsBucket,
        Key: key,
        Body: file,
      }),
    );
    return {
      url: `https://${this.awsBucket}.s3.${this.awsRegion}.amazonaws.com/${key}`,
    };
  }

  //   private readonly get publicGetOnlyPolicy(){
  //     return {
  //         "Version": "2012-10-17",
  //         "Statement": [
  //               {
  //               "Sid": "PublicReadForGetBucketObjects",
  //               "Effect": "Allow",
  //               "Principal": "*",
  //               "Action": "s3:GetObject",
  //                 "Resource": "arn:aws:s3:::meetmap-assets/events-assets/*"
  //             }
  //         ]
  //     }
  //   }
}

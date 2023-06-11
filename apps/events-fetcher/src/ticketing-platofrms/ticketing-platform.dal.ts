import { EventsFetcherDb } from '@app/database';
import { CreatorType, IApiKey, ITicketingPlatform } from '@app/types';
import { Injectable } from '@nestjs/common';
import { randomBytes, randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TicketingPlatformDal {
  constructor(private readonly db: EventsFetcherDb) {}

  public async findPlatformById(id: string) {
    return await this.db.models.ticketingPlatform.findById(id);
  }

  public async findPlatformByEmail(email: string) {
    return await this.db.models.ticketingPlatform.findOne({
      email: email,
    });
  }

  public async createPlatform(
    payload: Pick<
      ITicketingPlatform,
      | 'banner'
      | 'description'
      | 'image'
      | 'title'
      | 'websiteUrl'
      | 'email'
      | 'password'
    >,
  ) {
    return await this.db.models.ticketingPlatform.create({
      apiKeys: [],
      banner: payload.banner,
      description: payload.description,
      image: payload.image,
      title: payload.title,
      websiteUrl: payload.websiteUrl,
      email: payload.email,
      password: await this.hashPassword(payload.password),
    });
  }

  public async comparePassword(password: string, hash?: string) {
    if (!hash) {
      return false;
    }
    return await bcrypt.compare(password, hash);
  }

  public async hashPassword(password: string) {
    return await bcrypt.hash(password, 12);
  }

  public async updatePlatform(
    platformId: string,
    payload: Pick<
      ITicketingPlatform,
      'banner' | 'description' | 'image' | 'title' | 'websiteUrl'
    >,
  ) {
    return await this.db.models.ticketingPlatform.updateOne(
      {
        id: platformId,
      },
      {
        $set: {
          banner: payload.banner,
          description: payload.description,
          image: payload.image,
          title: payload.title,
          websiteUrl: payload.websiteUrl,
        },
      },
      {
        new: true,
      },
    );
  }

  public async deletePlatform(platformId: string) {
    await this.db.models.ticketingPlatform.deleteOne({
      id: platformId,
    });
    await this.db.models.event.deleteMany({
      'creator.creatorCId': platformId,
      'creator.type': CreatorType.TICKETING_PLATFOFRM,
    });
    return platformId;
  }

  public async issueApiKey(
    platformId: string,
    payload: Pick<IApiKey, 'title' | 'description'>,
  ) {
    /**
     * @todo make apiKeyModel istead
     */
    const key = this.generateApiKey();
    const platform = await this.db.models.ticketingPlatform.findById(
      platformId,
    );
    if (!platform) {
      return null;
    }
    const apiKey = await this.db.models.apiKey.create({
      issuedTo: platform.id,
      title: payload.title,
      description: payload.description,
      key: key,
    });
    return apiKey ?? null;
  }

  public async getPlatformApiKeys(platformId: string) {
    return await this.db.models.apiKey.find({
      issuedTo: platformId,
    });
  }

  public async revokeApiKey(platformId: string, apiKey: string) {
    return await this.db.models.apiKey.findOneAndDelete({
      issuedTo: platformId,
      key: apiKey,
    });
  }

  public async updatePlatformsRefreshToken(
    platformId: string,
    refreshToken: string | null,
  ) {
    return await this.db.models.ticketingPlatform.findByIdAndUpdate(
      platformId,
      {
        $set: {
          refreshToken: refreshToken,
        },
      },
      { new: true },
    );
  }

  private generateApiKey(): string {
    return randomBytes(30).toString('hex');
  }
}

import { Module } from '@nestjs/common';
import { YandexAfishaCrawlerDal } from './yandex-afisha-crawler.dal';
import { YandexAfishaCrawlerService } from './yandex-afisha-crawler.service';

@Module({
  providers: [YandexAfishaCrawlerDal, YandexAfishaCrawlerService],
})
export class YandexAfishaCrawlerModule {}

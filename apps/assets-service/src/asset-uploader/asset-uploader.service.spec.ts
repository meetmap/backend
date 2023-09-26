import { Test, TestingModule } from '@nestjs/testing';
import { AssetServiceUploaderDal } from './asset-uploader.dal';
import { AssetUploaderService } from './asset-uploader.service';

describe('AssetServiceUploaderService', () => {
  let assetsServiceService: AssetUploaderService;
  let assetsServiceDal: AssetServiceUploaderDal;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [AssetUploaderService, AssetServiceUploaderDal],
    }).compile();

    assetsServiceService = app.get<AssetUploaderService>(AssetUploaderService);

    assetsServiceDal = app.get<AssetServiceUploaderDal>(
      AssetServiceUploaderDal,
    );
  });

  describe('Status updates', () => {
    it('Asset Service Update status', () => {
      const not_existing_cid = 'not_existing_cid';
      expect(
        assetsServiceService.onPostProcessingSucceed(not_existing_cid),
      ).toEqual(assetsServiceDal.getAssetStatus(not_existing_cid));
    });

    it('Asset Service Update status', () => {
      const existing_cid = 'existing_cid';
      expect(
        assetsServiceService.onPostProcessingSucceed(existing_cid),
      ).toEqual(assetsServiceDal.getAssetStatus(existing_cid));
    });
  });
});

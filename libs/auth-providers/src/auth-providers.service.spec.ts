import { Test, TestingModule } from '@nestjs/testing';
import { AuthProvidersService } from './auth-providers.service';

describe('AuthProvidersService', () => {
  let service: AuthProvidersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthProvidersService],
    }).compile();

    service = module.get<AuthProvidersService>(AuthProvidersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

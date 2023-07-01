import { Global, Module } from '@nestjs/common';
import { FacebookAuthProvider } from './facebook';

@Global()
@Module({
  providers: [FacebookAuthProvider],
  exports: [FacebookAuthProvider],
})
export class AuthProvidersModule {}

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { LibModule } from './shared/libs/lib.module';
import { AuthModule } from './shared/libs/auth/auth.module';
import { JwtAuthGuard } from './shared/libs/auth/jwt-auth.guard';

@Module({
  imports: [LibModule, AuthModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [LibModule, AuthModule]
})
export class AppModule { }

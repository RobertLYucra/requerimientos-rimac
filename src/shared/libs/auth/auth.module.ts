import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JWT_CONFIG } from './jwt.config';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secret: JWT_CONFIG.secret,
            signOptions: { expiresIn: JWT_CONFIG.accessTokenExpiration as any },
        }),
    ],
    providers: [JwtStrategy, JwtAuthGuard],
    exports: [JwtModule, JwtStrategy, JwtAuthGuard],
})
export class AuthModule { }

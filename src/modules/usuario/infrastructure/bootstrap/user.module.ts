import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppModule } from 'src/app.module';
import { UserEntity } from '../../domain/entity/user.entity';
import { RoleEntity } from '../../domain/entity/role.entity';
import { UserController } from '../api/user.controller';
import { UserUseCase } from '../../application/use-cases/user.usecase';
import { UserMysqlRepository } from '../repository/mysql/user-mysql.repository';
import { AuthModule } from 'src/shared/libs/auth/auth.module';

@Module({
  imports: [AppModule, TypeOrmModule.forFeature([UserEntity, RoleEntity]), AuthModule],
  controllers: [UserController],
  providers: [
    UserUseCase,
    {
      provide: 'IUserRepository',
      useClass: UserMysqlRepository
    }
  ],
  exports: []
})
export class UserModule { }

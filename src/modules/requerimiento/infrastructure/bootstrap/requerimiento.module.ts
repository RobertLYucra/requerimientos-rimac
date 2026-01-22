import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppModule } from 'src/app.module';
import { RequerimientoController } from '../api/requerimiento.controller';
import { BiddingCatalogEntity } from '../../domain/entity/bidding-catalog.entity';
import { StaffingRequestEntity } from '../../domain/entity/staffing-request.entity';
import { CreateRequerimientoUseCase } from '../../application/use-case/create-requirimiento.usecase';
import { StaffingRequestMysqlRepository } from '../repository/mysql/staffing-request-mysql.repository';
import { BiddingCatalogMysqlRepository } from '../repository/mysql/bidding-catalog-mysql.repository';
import { GetAllRequerimientoUseCase } from '../../application/use-case/get-all-requerimiento.usecase';
import { GetRequerimientoByIdUseCase } from '../../application/use-case/get-requerimiento-by-id.usecase';
import { UpdateRequerimientoUseCase } from '../../application/use-case/update-requerimiento.usecase';

@Module({
  imports: [AppModule, TypeOrmModule.forFeature([BiddingCatalogEntity, StaffingRequestEntity])],
  controllers: [RequerimientoController],
  providers: [
    CreateRequerimientoUseCase,
    {
      provide: 'IStaffingRequestRepository',
      useClass: StaffingRequestMysqlRepository
    },
    {
      provide: 'IBiddingCatalogRepository',
      useClass: BiddingCatalogMysqlRepository
    },
    GetAllRequerimientoUseCase,
    GetRequerimientoByIdUseCase,
    UpdateRequerimientoUseCase
  ],
  exports: []
})
export class RequerimientoModule { }

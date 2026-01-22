import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { IStaffingRequestRepository } from '../../../domain/repository/staffing-request.repository';
import { StaffingRequestEntity } from '../../../domain/entity/staffing-request.entity';
import { GetAllRequestRequestDto } from 'src/modules/requerimiento/application/dto/request/get-all-request.request.dto';

@Injectable()
export class StaffingRequestMysqlRepository implements IStaffingRequestRepository {
    constructor(
        @InjectRepository(StaffingRequestEntity)
        private readonly repository: Repository<StaffingRequestEntity>
    ) { }

    save(entity: StaffingRequestEntity): Promise<StaffingRequestEntity> {
        return this.repository.save(entity);
    }

    create(data: Partial<StaffingRequestEntity>): StaffingRequestEntity {
        return this.repository.create(data);
    }

    async findByCodPedido(codPedido: string): Promise<StaffingRequestEntity | null> {
        return await this.repository.findOne({ where: { codPedido: codPedido } });
    }

    async findById(id: number): Promise<StaffingRequestEntity | null> {
        return await this.repository.findOne({
            where: { id },
            relations: ["bidding"]
        });
    }

    async findAll(query: GetAllRequestRequestDto): Promise<[StaffingRequestEntity[], number]> {
        const { page, perPage, search, indraStatus, biddingId } = query;
        const take = perPage;
        const skip = (page - 1) * perPage;
        const where = {};
        if (search) {
            where["codPedido"] = Like(`%${search}%`);
        }
        if (indraStatus) {
            where["indraStatus"] = indraStatus;
        }
        if (biddingId) {
            where["biddingId"] = biddingId;
        }
        return await this.repository.findAndCount({
            where,
            take,
            skip,
            order: {
                fechaIngresoReq: "DESC"
            },
            relations: ["bidding"]
        });
    }
}

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IBiddingCatalogRepository } from '../../../domain/repository/bidding-catalog.repository';
import { BiddingCatalogEntity } from '../../../domain/entity/bidding-catalog.entity';

@Injectable()
export class BiddingCatalogMysqlRepository implements IBiddingCatalogRepository {
    constructor(
        @InjectRepository(BiddingCatalogEntity)
        private readonly repository: Repository<BiddingCatalogEntity>
    ) { }

    findByName(name: string): Promise<BiddingCatalogEntity | null> {
        return this.repository.findOne({ where: { name } });
    }
}

import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { StaffingRequestEntity } from './staffing-request.entity';

@Entity('bidding_catalog')
export class BiddingCatalogEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50, unique: true, nullable: false })
    name: string;

    @OneToMany(() => StaffingRequestEntity, (request) => request.bidding)
    requests: StaffingRequestEntity[];

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'active', type: 'tinyint', default: () => '1' })
    active: boolean;
}

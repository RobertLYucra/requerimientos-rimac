import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { RoleEntity } from './role.entity';

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255, unique: true, nullable: false })
    email: string;

    @Column({ length: 255, nullable: false })
    password: string;

    @Column({ name: 'name', length: 150, nullable: true })
    name: string;

    @Column({ name: 'last_name', length: 150, nullable: true })
    lastName: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'role_id', nullable: false })
    roleId: number;

    @Column({ name: 'deleted', type: 'tinyint', default: 0, nullable: false })
    deleted: boolean;

    // La relación mágica
    @ManyToOne(() => RoleEntity, (role) => role.users)
    @JoinColumn({ name: 'role_id' }) // Esto crea la columna 'role_id' en la BD
    role: RoleEntity;
}
import { Injectable } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { UserEntity } from '../../../domain/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IUserRepository } from 'src/modules/usuario/domain/repository/user.repository';
import { ApiException } from 'src/shared/libs/exceptions/api.exception';
import { GetAllUserRequestDto } from 'src/modules/usuario/application/dto/request/get-all-user.request.dto';

@Injectable()
export class UserMysqlRepository implements IUserRepository {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>) {
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        try {
            return await this.userRepository.findOne({ where: { email, deleted: false }, relations: ['role'] });
        } catch (error) {
            throw ApiException.internalServerError('Error al buscar usuario', 'USER_NOT_FOUND');
        }
    }

    async findByPassword(password: string): Promise<UserEntity | null> {
        try {
            return await this.userRepository.findOne({ where: { password, deleted: false } });
        } catch (error) {
            throw ApiException.internalServerError('Error al buscar usuario', 'USER_NOT_FOUND');
        }
    }

    async findByEmailAndPassword(email: string, password: string): Promise<UserEntity | null> {
        try {
            return await this.userRepository.findOne({ where: { email, password, deleted: false } });
        } catch (error) {
            throw ApiException.internalServerError('Error al buscar usuario', 'USER_NOT_FOUND');
        }
    }

    async createUser(user: Partial<UserEntity>): Promise<UserEntity> {
        try {
            return await this.userRepository.save(user);
        } catch (error) {
            throw ApiException.internalServerError('Error al crear usuario', 'USER_NOT_FOUND');
        }
    }

    async updateUser(id: number, user: Partial<UserEntity>): Promise<void> {
        try {
            await this.userRepository.update(id, user);
        } catch (error) {
            throw ApiException.internalServerError('Error al actualizar usuario', 'USER_NOT_UPDATED');
        }
    }

    async getAllUsers(payload: GetAllUserRequestDto) {
        try {

            const whereConditions: any = { deleted: false };

            if (payload.roleId) {
                whereConditions.roleId = payload.roleId;
            }

            if (payload.isActive) {
                whereConditions.isActive = payload.isActive;
            }

            if (payload.search) {
                whereConditions.name = Like(`%${payload.search}%`);
                whereConditions.email = Like(`%${payload.search}%`);
                whereConditions.lastName = Like(`%${payload.search}%`);
            }

            const [users, count] = await this.userRepository.findAndCount({
                relations: ['role'],
                where: whereConditions,
                skip: (payload.page - 1) * payload.perPage,
                take: payload.perPage
            });

            return { users, count };
        } catch (error) {
            throw ApiException.internalServerError('Error al buscar usuarios', 'USERS_NOT_FOUND');
        }
    }
}
import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { LoginUserRequestDto } from "../dto/request/login-user.request.dto";
import { Inject } from "@nestjs/common";
import { IUserRepository } from "../../domain/repository/user.repository";
import { ApiException } from "src/shared/libs/exceptions/api.exception";
import { PaginatedUserResponseDto, UserResponseDto } from "../dto/response/user.response.dto";
import { RegisterUserRequestDto } from "../dto/request/register-user.request.dto";
import { UserEntity } from "../../domain/entity/user.entity";
import { GetAllUserRequestDto } from "../dto/request/get-all-user.request.dto";
import { PaginationUtil } from "src/shared/libs/utils/pagination.util";
import { JwtService } from "@nestjs/jwt";
import { JWT_CONFIG } from "src/shared/libs/auth/jwt.config";
import { RefreshTokenRequestDto } from "../dto/request/refresh-token.request.dto";

@Injectable()
export class UserUseCase {
    constructor(
        @Inject('IUserRepository')
        private readonly userRepository: IUserRepository,
        private readonly jwtService: JwtService
    ) { }

    async loginUser(payload: LoginUserRequestDto) {
        const user = await this.userRepository.findByEmail(payload.email);
        if (!user) {
            throw ApiException.notFound('Usuario no encontrado');
        }

        const isPasswordValid = await bcrypt.compare(payload.password, user.password);
        if (!isPasswordValid) {
            throw ApiException.unauthorized('Contraseña incorrecta');
        }

        const jwtPayload = { sub: user.id, email: user.email, role: user.role?.name };
        const accessToken = this.jwtService.sign(jwtPayload);
        const refreshToken = this.jwtService.sign(jwtPayload, {
            secret: JWT_CONFIG.refreshSecret,
            expiresIn: JWT_CONFIG.refreshTokenExpiration as any,
        });

        const userResponse: UserResponseDto = {
            id: user.id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            authorization: {
                token: accessToken,
                refreshToken: refreshToken
            }
        };

        return userResponse;
    }

    async refreshToken(payload: RefreshTokenRequestDto) {
        try {
            const decoded = this.jwtService.verify(payload.refreshToken, {
                secret: JWT_CONFIG.refreshSecret,
            });

            const user = await this.userRepository.findByEmail(decoded.email);
            if (!user) {
                throw ApiException.unauthorized('Token inválido', 'INVALID_TOKEN');
            }

            const jwtPayload = { sub: user.id, email: user.email, role: user.role?.name };
            const accessToken = this.jwtService.sign(jwtPayload);

            return { token: accessToken };
        } catch {
            throw ApiException.unauthorized('Token de refresco inválido o expirado', 'INVALID_REFRESH_TOKEN');
        }
    }

    async registerUser(payload: RegisterUserRequestDto) {
        const user = await this.userRepository.findByEmail(payload.email);
        if (user) {
            throw ApiException.badRequest('Usuario ya existe', 'USER_ALREADY_EXISTS');
        }

        const hashedPassword = await bcrypt.hash(payload.password, 10);
        const userResponse: Partial<UserEntity> = {
            name: payload.name,
            lastName: payload.lastName,
            email: payload.email,
            password: hashedPassword,
            roleId: payload.roleId,
        };

        const createdUser = await this.userRepository.createUser(userResponse);
        const userResponseDto: UserResponseDto = {
            id: createdUser.id,
            name: createdUser.name,
            lastName: createdUser.lastName,
            email: createdUser.email,
            role: createdUser.role
        };

        return userResponseDto;
    }

    async getAllUsers(payload: GetAllUserRequestDto): Promise<PaginatedUserResponseDto> {
        const { users, count } = await this.userRepository.getAllUsers(payload);
        const pagination = PaginationUtil(count, payload.page, payload.perPage);
        const usersResponse: UserResponseDto[] = users.map((user) => ({
            id: user.id,
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        }));
        return { data: usersResponse, pagination };
    }
}
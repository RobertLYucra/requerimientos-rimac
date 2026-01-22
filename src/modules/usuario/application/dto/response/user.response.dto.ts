import { RoleEntity } from "src/modules/usuario/domain/entity/role.entity";
import { PaginationMetadata } from "src/shared/libs/utils/pagination.util";

export interface UserResponseDto {
    id: number;
    name: string;
    email: string;
    role: RoleEntity;
    lastName: string;
    authorization?: {
        token?: string;
        refreshToken?: string;
    };
}

export interface PaginatedUserResponseDto {
    data: UserResponseDto[];
    pagination: PaginationMetadata;
}
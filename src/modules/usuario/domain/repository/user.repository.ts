import { GetAllUserRequestDto } from "../../application/dto/request/get-all-user.request.dto";
import { UserEntity } from "../entity/user.entity";

export interface IUserRepository {
    findByEmail(email: string): Promise<UserEntity | null>;
    findByPassword(password: string): Promise<UserEntity | null>;
    findByEmailAndPassword(email: string, password: string): Promise<UserEntity | null>;
    createUser(user: Partial<UserEntity>): Promise<UserEntity>;
    updateUser(id: number, user: Partial<UserEntity>): Promise<void>;
    getAllUsers(payload: GetAllUserRequestDto): Promise<{ users: UserEntity[]; count: number }>;
}
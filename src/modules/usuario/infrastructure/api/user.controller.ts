import { Body, Controller, Get, Post, Put, Query, UseGuards } from "@nestjs/common";
import { UserUseCase } from "../../application/use-cases/user.usecase";
import { LoginUserRequestDto } from "../../application/dto/request/login-user.request.dto";
import { ApiResponse, ResponseUtil } from "src/shared/libs/utils/response.util";
import { PaginatedUserResponseDto, UserResponseDto } from "../../application/dto/response/user.response.dto";
import { RegisterUserRequestDto } from "../../application/dto/request/register-user.request.dto";
import { GetAllUserRequestDto } from "../../application/dto/request/get-all-user.request.dto";
import { PaginatedResponse } from "src/shared/libs/utils/pagination.util";
import { Public } from "src/shared/libs/auth/public.decorator";
import { RefreshTokenRequestDto } from "../../application/dto/request/refresh-token.request.dto";
import { JwtAuthGuard } from "src/shared/libs/auth/jwt-auth.guard";

@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(
        private readonly userUseCase: UserUseCase
    ) { }

    @Get("get-all-users")
    async getAllUsers(@Query() payload: GetAllUserRequestDto): Promise<ApiResponse<PaginatedResponse<UserResponseDto>>> {
        const userResponse = await this.userUseCase.getAllUsers(payload);
        return ResponseUtil.success('Usuarios obtenidos correctamente', userResponse);
    }

    @Public()
    @Post('login')
    async loginUser(@Body() payload: LoginUserRequestDto): Promise<ApiResponse<UserResponseDto>> {
        const userResponse = await this.userUseCase.loginUser(payload);
        return ResponseUtil.success('Usuario logueado correctamente', userResponse);
    }

    @Post('register')
    async registerUser(@Body() payload: RegisterUserRequestDto): Promise<ApiResponse<UserResponseDto>> {
        const userResponse = await this.userUseCase.registerUser(payload);
        return ResponseUtil.success('Usuario registrado correctamente', userResponse);
    }

    /*     @Put("update-user")
        async updateUser(@Body() payload: UpdateUserRequestDto): Promise<ApiResponse<UserResponseDto>> {
            const userResponse = await this.userUseCase.updateUser(payload);
            return ResponseUtil.success('Usuario actualizado correctamente', userResponse);
        } */

    @Public()
    @Post('refresh')
    async refreshToken(@Body() payload: RefreshTokenRequestDto): Promise<ApiResponse<{ token: string }>> {
        const tokenResponse = await this.userUseCase.refreshToken(payload);
        return ResponseUtil.success('Token refrescado correctamente', tokenResponse);
    }
}
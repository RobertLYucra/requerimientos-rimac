import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class GetAllUserRequestDto {
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    page: number = 1;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    perPage: number = 10;

    @IsString()
    @IsOptional()
    search?: string;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    roleId?: number;

    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    isActive?: boolean;
}
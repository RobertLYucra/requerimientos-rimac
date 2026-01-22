import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class GetAllRequestRequestDto {
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
    @Type(() => String)
    search?: string;

    @IsString()
    @IsOptional()
    @Type(() => String)
    indraStatus?: string;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    biddingId?: number;
}
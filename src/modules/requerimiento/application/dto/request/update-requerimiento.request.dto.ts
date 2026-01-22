import { Type } from "class-transformer";
import { IsDateString, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { RequestType, TeamType } from "../../../domain/entity/staffing-request.entity";

export class UpdateRequerimientoRequestDto {
    @IsString()
    @IsOptional()
    @Type(() => String)
    estadoIndra?: string;

    @IsString()
    @IsOptional()
    @Type(() => String)
    comentarioRimac?: string;

    @IsString()
    @IsOptional()
    @Type(() => String)
    comentarioOperacion?: string;

    @IsDateString()
    @IsOptional()
    fechaInicioTalento?: Date;

    @IsDateString()
    @IsOptional()
    fechaCierreReq?: Date;

    @IsNumber()
    @IsOptional()
    cantidadCvPresentados?: number;

    @IsString()
    @IsOptional()
    perfil?: string;

    @IsString()
    @IsOptional()
    codPedido?: string; // Sometimes updated? Likely not, but listed.

    // Add other fields as necessary based on entity
    @IsOptional()
    @Type(() => Number)
    biddingId?: number;

    @IsOptional()
    @IsString()
    solicitante?: string;

    @IsOptional()
    @IsString()
    proyecto?: string;
}

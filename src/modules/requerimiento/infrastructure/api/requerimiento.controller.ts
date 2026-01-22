import { Body, Controller, Get, Param, Post, Put, Query } from "@nestjs/common";
import { Public } from "src/shared/libs/auth/public.decorator";
import { CreateRequerimientoUseCase } from "../../application/use-case/create-requirimiento.usecase";
import { GetAllRequestRequestDto } from "../../application/dto/request/get-all-request.request.dto";
import { GetAllRequerimientoUseCase } from "../../application/use-case/get-all-requerimiento.usecase";
import { GetRequerimientoByIdUseCase } from "../../application/use-case/get-requerimiento-by-id.usecase";
import { UpdateRequerimientoUseCase } from "../../application/use-case/update-requerimiento.usecase";
import { UpdateRequerimientoRequestDto } from "../../application/dto/request/update-requerimiento.request.dto";
import { ApiResponse, ResponseUtil } from "src/shared/libs/utils/response.util";
import { RequerimientoResponseDto } from "../../application/dto/response/requerimiento.response.dto";
import { PaginatedResponse } from "src/shared/libs/utils/pagination.util";

@Controller('requerimiento')
export class RequerimientoController {
    constructor(
        private readonly createRequerimientoUseCase: CreateRequerimientoUseCase,
        private readonly getAllRequestUseCase: GetAllRequerimientoUseCase,
        private readonly getRequerimientoByIdUseCase: GetRequerimientoByIdUseCase,
        private readonly updateRequerimientoUseCase: UpdateRequerimientoUseCase
    ) { }

    @Post("receive-event-from-email")
    @Public()
    async receiveEventFromEmail(@Body() payload: any) {
        return await this.createRequerimientoUseCase.createRequest(payload);
    }

    @Get("get-all-requests")
    @Public()
    async getAll(@Query() query: GetAllRequestRequestDto): Promise<ApiResponse<PaginatedResponse<RequerimientoResponseDto>>> {
        const response = await this.getAllRequestUseCase.getAllRequests(query);
        return ResponseUtil.success("Requerimientos obtenidos exitosamente", response);
    }

    @Get("get-request-by-id/:id")
    @Public()
    async getById(@Param("id") id: number) {
        const response = await this.getRequerimientoByIdUseCase.execute(id);
        return ResponseUtil.success("Requerimiento obtenido exitosamente", response);
    }

    @Put("update-request/:id")
    @Public()
    async update(@Param("id") id: number, @Body() payload: UpdateRequerimientoRequestDto) {
        const response = await this.updateRequerimientoUseCase.execute(id, payload);
        return ResponseUtil.success("Requerimiento actualizado exitosamente", response);
    }
}

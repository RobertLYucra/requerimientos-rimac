import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { IStaffingRequestRepository } from "../../domain/repository/staffing-request.repository";
import { UpdateRequerimientoRequestDto } from "../dto/request/update-requerimiento.request.dto";
import { RequerimientoResponseDto } from "../dto/response/requerimiento.response.dto";
import { RequerimientoMapping } from "../mapping/requerimiento.mapping";
import { DateUtil } from "src/shared/libs/utils/date.util";

@Injectable()
export class UpdateRequerimientoUseCase {
    constructor(
        @Inject("IStaffingRequestRepository")
        private readonly staffingRequestRepository: IStaffingRequestRepository
    ) { }

    async execute(id: number, payload: UpdateRequerimientoRequestDto): Promise<RequerimientoResponseDto> {
        const existingRequest = await this.staffingRequestRepository.findById(id);

        if (!existingRequest) {
            throw new NotFoundException(`Requerimiento with id ${id} not found`);
        }

        // Update fields
        Object.assign(existingRequest, payload);
        existingRequest.fechaActualizacion = DateUtil.getPeruDate();

        // Recalculate derived properties if needed (entity @AfterLoad does it on load, but for saving/returning we might want to ensure consistency)
        // Actually @AfterLoad is for loading. If we modified fields that affect calculation, we might want to run logic or just save.
        // If we save and load again, we get fresh values. Or we can just calculate.
        existingRequest.calculateDerivedProperties();

        const savedRequest = await this.staffingRequestRepository.save(existingRequest);

        return RequerimientoMapping.toResponseDto(savedRequest);
    }
}

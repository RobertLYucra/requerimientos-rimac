import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { IStaffingRequestRepository } from "../../domain/repository/staffing-request.repository";
import { RequerimientoResponseDto } from "../dto/response/requerimiento.response.dto";
import { RequerimientoMapping } from "../mapping/requerimiento.mapping";

@Injectable()
export class GetRequerimientoByIdUseCase {
    constructor(
        @Inject("IStaffingRequestRepository")
        private readonly staffingRequestRepository: IStaffingRequestRepository
    ) { }

    async execute(id: number): Promise<RequerimientoResponseDto> {
        const staffingRequest = await this.staffingRequestRepository.findById(id);

        if (!staffingRequest) {
            throw new NotFoundException(`Requerimiento with id ${id} not found`);
        }

        // Calculations are handled by @AfterLoad in Entity, but Mapping also does it if needed or mapping explicit fields.
        // Mapping.toResponseDto handles the mapping including calling local calculation methods if they are in the mapping class.
        // Wait, RequerimientoMapping computes values like 'indicador' manually in toResponseDto.
        // So we MUST use RequerimientoMapping.toResponseDto to get the correct calculated values as user requested (excel formulas).

        return RequerimientoMapping.toResponseDto(staffingRequest);
    }
}

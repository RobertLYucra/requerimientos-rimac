import { Inject, Injectable } from "@nestjs/common";
import { IStaffingRequestRepository } from "../../domain/repository/staffing-request.repository";
import { IBiddingCatalogRepository } from "../../domain/repository/bidding-catalog.repository";
import { GetAllRequestRequestDto } from "../dto/request/get-all-request.request.dto";
import { PaginationUtil } from "src/shared/libs/utils/pagination.util";
import { RequerimientoResponseDto } from "../dto/response/requerimiento.response.dto";
import { RequerimientoMapping } from "../mapping/requerimiento.mapping";

@Injectable()
export class GetAllRequerimientoUseCase {
    constructor(
        @Inject("IStaffingRequestRepository")
        private readonly staffingRequestRepository: IStaffingRequestRepository,
        @Inject("IBiddingCatalogRepository")
        private readonly biddingCatalogRepository: IBiddingCatalogRepository
    ) { }

    async getAllRequests(query: GetAllRequestRequestDto) {
        const [requests, total] = await this.staffingRequestRepository.findAll(query);

        const data = requests.map(request => RequerimientoMapping.toResponseDto(request));
        const pagination = PaginationUtil(total, query.page, query.perPage);

        return {
            data,
            pagination
        };
    }
}

import { GetAllRequestRequestDto } from "../../application/dto/request/get-all-request.request.dto";
import { StaffingRequestEntity } from "../entity/staffing-request.entity";

export interface IStaffingRequestRepository {
    save(entity: StaffingRequestEntity): Promise<StaffingRequestEntity>;
    create(data: Partial<StaffingRequestEntity>): StaffingRequestEntity;
    findByCodPedido(codPedido: string): Promise<StaffingRequestEntity | null>;
    findById(id: number): Promise<StaffingRequestEntity | null>;

    findAll(query: GetAllRequestRequestDto): Promise<[StaffingRequestEntity[], number]>;
}

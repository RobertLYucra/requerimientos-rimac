import { StaffingRequestEntity, TeamType } from "../../domain/entity/staffing-request.entity";
import { RequerimientoResponseDto } from "../dto/response/requerimiento.response.dto";
import { DateUtil } from "../../../../shared/libs/utils/date.util";

export class RequerimientoMapping {
    static toResponseDto(entity: StaffingRequestEntity): RequerimientoResponseDto {
        return {
            id: entity.id,
            codPedido: entity.codPedido,
            codGabin: entity.codGabin,
            numeroQ: entity.numeroQ,
            tipoRequerimiento: entity.tipoRequerimiento,
            tiempoMeses: entity.tiempoMeses,
            perfil: entity.perfil,
            biddingId: entity.biddingId,
            bidding: entity.bidding,
            fechaIngresoReq: entity.fechaIngresoReq,
            mesIngresoReq: entity.fechaIngresoReq ? DateUtil.getMonthName(entity.fechaIngresoReq) : '',
            fechaIngresoSolicitada: entity.fechaIngresoSolicitada,
            mesIngresoRimac: this.calculateMesIngresoRimac(entity),
            fechaIngresoLimite: entity.fechaIngresoLimite,
            indicador: this.calculateIndicador(entity),
            estadoIndra: entity.estadoIndra,
            fechaCierreReq: entity.fechaCierreReq,
            fechaInicioTalento: entity.fechaInicioTalento,
            mesIngreso: this.calculateMesIngreso(entity),
            indicadorLeadTime: this.calculateIndicadorLeadTime(entity),
            indicadorPenalidad: entity.indicadorPenalidad,
            mesCierre: this.calculateMesCierre(entity),
            fechaOrigen: entity.fechaOrigen,
            tipoEquipo: this.calculateTipoEquipo(entity),
            cantidadCvPresentados: entity.cantidadCvPresentados,
            ratioD: entity.ratioD,
            comentarioOperacion: entity.comentarioOperacion,
            comentarioRimac: entity.comentarioRimac,
            columna1: entity.columna1,
            proyecto: entity.proyecto,
            perfilesOpcionales: entity.perfilesOpcionales,
            solicitante: entity.solicitante,
            fechaActualizacion: entity.fechaActualizacion,
            fechaCreacion: entity.fechaCreacion
        };
    }

    private static calculateTipoEquipo(entity: StaffingRequestEntity): TeamType {
        if (entity.perfil) {
            const normalized = entity.perfil.toUpperCase();
            if (normalized.includes('BACKEND') || normalized.includes('FRONTEND')) return TeamType.ADICIONAL_1;
            if (normalized.includes('CALIDAD') || normalized.includes('QA')) return TeamType.ADICIONAL_3;
            if (normalized.includes('SQUAD') || normalized.includes('AGIL')) return TeamType.AGIL;
        }
        return TeamType.TRADICIONAL;
    }

    private static calculateMesIngresoRimac(entity: StaffingRequestEntity): string {
        return entity.fechaIngresoSolicitada ? DateUtil.getMonthName(entity.fechaIngresoSolicitada) : '';
    }

    private static calculateIndicador(entity: StaffingRequestEntity): string {
        if (!entity.fechaIngresoLimite) return '';
        const limit = DateUtil.getPeruDate(entity.fechaIngresoLimite);
        const today = DateUtil.getPeruDate();

        // Normalize to midnight
        limit.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const diffTime = limit.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return 'VENCIDO';
        if (diffDays <= 3) return 'POR VENCER';
        return 'EN PLAZO';
    }

    private static calculateMesIngreso(entity: StaffingRequestEntity): string {
        const date = entity.fechaInicioTalento || entity.fechaCierreReq;
        return date ? DateUtil.getMonthName(date) : '';
    }

    private static calculateMesCierre(entity: StaffingRequestEntity): string {
        return entity.fechaCierreReq ? DateUtil.getMonthName(entity.fechaCierreReq) : '';
    }

    private static calculateIndicadorLeadTime(entity: StaffingRequestEntity): string {
        const estado = entity.estadoIndra ? entity.estadoIndra.toUpperCase() : '';
        const reqDate = entity.fechaIngresoReq;
        if (!reqDate) return 'No aplica';

        const today = DateUtil.getPeruDate();

        let endDate: Date | undefined;

        if (estado === 'CERRADO' || estado === 'CUBIERTO OTRO') {
            endDate = entity.fechaInicioTalento || entity.fechaCierreReq;
        } else if (estado === 'ENTREVISTA' || estado === 'PENDIENTE CV') {
            endDate = today;
        }

        if (endDate) {
            const days = DateUtil.getBusinessDays(reqDate, endDate);
            return days.toString();
        }

        return 'No aplica';
    }
}
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
            mesIngresoReq: entity.mesIngresoReq, // Calculated in entity or here? Assuming entity logic for now, but user asked for specific fields here.
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
        // Logic: Search bidding? User said VLOOKUP(BIDDING).
        // If bidding entity has info, use it. Otherwise fell back to profile logic.
        // Assuming current simple profile logic for now as we don't have the VLOOKUP table source.
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
        // User logic: M731-HOY() < 0 -> VENCIDO (Limit < Today)
        // M731-HOY() <= 3 -> POR VENCER (Limit - Today <= 3)
        // ELSE -> EN PLAZO

        if (diffDays < 0) return 'VENCIDO';
        if (diffDays <= 3) return 'POR VENCER';
        return 'EN PLAZO';
    }

    private static calculateMesIngreso(entity: StaffingRequestEntity): string {
        // User said: F. INICIO TALENTO / CIERRE. Assuming Start Date takes precedence or fallback to closure?
        // Formula: =TEXTO([@[F. INICIO TALENTO / CIERRE]];"mmmm")
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

        // Logic:
        // CERRADO -> NetworkDays(Req, TalentStart OR Closure)
        // CUBIERTO OTRO -> NetworkDays(Req, TalentStart OR Closure)
        // ENTREVISTA -> NetworkDays(Req, Today)
        // PENDIENTE CV -> NetworkDays(Req, Today)

        let endDate: Date | undefined;

        if (estado === 'CERRADO' || estado === 'CUBIERTO OTRO') {
            endDate = entity.fechaInicioTalento || entity.fechaCierreReq;
        } else if (estado === 'ENTREVISTA' || estado === 'PENDIENTE CV') {
            endDate = today;
        }

        if (endDate) {
            // Note: Returning the NUMBER of days? Or string?
            // The user formula returns DIAS.LAB results (number).
            // But the field name is 'indicadorLeadTime', which usually implies a string status (CUMPLE/NO CUMPLE)?
            // Creating both logic? The request says "Indicar leadt time: =SI(...)". 
            // The previous logic was CUMPLE/NO CUMPLE. 
            // If the user wants the DAYS count as the indicator, I should return stringified number.
            // Let's assume return number as string.
            const days = DateUtil.getBusinessDays(reqDate, endDate);
            return days.toString();
        }

        return 'No aplica';
    }
}
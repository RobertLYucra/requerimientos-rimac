import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, AfterLoad } from 'typeorm';
import { BiddingCatalogEntity } from './bidding-catalog.entity';
import { DateUtil } from '../../../../shared/libs/utils/date.util';

export enum RequestType {
    NUEVO_RQ = 'Nuevo RQ',
    REEMPLAZO = 'Reemplazo',
    OTROS = 'otros',
    VACIO = 'vacio',
}

export enum TeamType {
    TRADICIONAL = 'tradicional',
    AGIL = 'agil',
    ADICIONAL_1 = 'Adicional 1',
    ADICIONAL_3 = 'Adicional 3',
}

@Entity('staffing_requests')
export class StaffingRequestEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'cod_pedido', length: 50, nullable: true })
    codPedido: string;

    @Column({ name: 'cod_gabin', length: 50, nullable: true })
    codGabin: string;

    @Column({ name: 'numero_q', type: 'int', nullable: true })
    numeroQ: number;

    @Column({
        name: 'tipo_requerimiento',
        type: 'enum',
        enum: RequestType,
        default: RequestType.VACIO
    })
    tipoRequerimiento: RequestType;

    @Column({ name: 'tiempo_meses', type: 'decimal', precision: 10, scale: 1, nullable: true })
    tiempoMeses: number;

    @Column({ length: 100, nullable: true })
    perfil: string;

    @Column({ name: 'bidding_id', nullable: true })
    biddingId: number;

    @ManyToOne(() => BiddingCatalogEntity, (bidding) => bidding.requests)
    @JoinColumn({ name: 'bidding_id', })
    bidding?: BiddingCatalogEntity | null;

    @Column({ name: 'fecha_ingreso_req', type: 'date', nullable: true })
    fechaIngresoReq: Date;

    mesIngresoReq: string;

    @Column({ name: 'fecha_ingreso_solicitada', type: 'date', nullable: true })
    fechaIngresoSolicitada: Date;

    mesIngresoRimac: string;

    fechaIngresoLimite: Date;

    indicador: string;

    @Column({ name: 'estado_indra', length: 50, nullable: true })
    estadoIndra: string;

    @Column({ name: 'fecha_cierre_req', type: 'date', nullable: true })
    fechaCierreReq: Date;

    @Column({ name: 'fecha_inicio_talento', type: 'date', nullable: true })
    fechaInicioTalento: Date;

    mesIngreso: string;

    indicadorLeadTime: string;

    @Column({ name: 'indicador_penalidad', length: 50, nullable: true })
    indicadorPenalidad: string;

    mesCierre: string;

    @Column({ name: 'fecha_origen', type: 'date', nullable: true })
    fechaOrigen: Date;

    tipoEquipo: TeamType;

    @Column({ name: 'cantidad_cv_presentados', type: 'int', nullable: true })
    cantidadCvPresentados: number;

    @Column({ name: 'ratio_d', type: 'decimal', precision: 5, scale: 2, nullable: true })
    ratioD: number;

    @Column({ name: 'comentario_operacion', type: 'text', nullable: true })
    comentarioOperacion: string;

    @Column({ name: 'comentario_rimac', type: 'text', nullable: true })
    comentarioRimac: string;

    @Column({ name: 'column_1', length: 255, nullable: true })
    columna1: string;

    @Column({ length: 100, nullable: true })
    proyecto: string;

    @Column({ name: 'perfiles_opcionales', type: 'text', nullable: true })
    perfilesOpcionales: string;

    @Column({ name: 'solicitante', length: 255, nullable: true })
    solicitante: string;

    @Column({ name: 'fecha_actualizacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fechaActualizacion: Date;

    @Column({ name: 'fecha_creacion', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fechaCreacion: Date;
    @AfterLoad()
    calculateDerivedProperties() {
        // 1. Team Type
        if (this.perfil) {
            const normalized = this.perfil.toUpperCase();
            if (normalized.includes('BACKEND') || normalized.includes('FRONTEND')) {
                this.tipoEquipo = TeamType.ADICIONAL_1;
            } else if (normalized.includes('CALIDAD') || normalized.includes('QA')) {
                this.tipoEquipo = TeamType.ADICIONAL_3;
            } else if (normalized.includes('SQUAD') || normalized.includes('AGILE')) {
                this.tipoEquipo = TeamType.AGIL;
            } else {
                this.tipoEquipo = TeamType.TRADICIONAL;
            }
        }

        // Calculate Q Number (numeroQ) based on Requested Entry Date
        if (this.fechaIngresoReq) {
            // Safe check if it's a string, though DateUtil handles it, here we might need Date methods
            const date = DateUtil.getPeruDate(this.fechaIngresoReq);
            const month = date.getMonth() + 1; // 1-12
            this.numeroQ = Math.ceil(month / 3);
        }

        // 2. Rimac Entry Month
        if (this.fechaIngresoSolicitada) {
            this.mesIngresoRimac = DateUtil.getMonthName(this.fechaIngresoSolicitada);
        }

        // 3. Limit Entry Date & Indicator
        if (this.fechaIngresoReq) {
            this.fechaIngresoLimite = DateUtil.addBusinessDays(this.fechaIngresoReq, 10);

            const now = DateUtil.getPeruDate();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const limit = new Date(this.fechaIngresoLimite.getFullYear(), this.fechaIngresoLimite.getMonth(), this.fechaIngresoLimite.getDate());

            this.indicador = today <= limit ? 'A TIEMPO' : 'FUERA DE PLAZO';
        }

        // 4. Entry Month
        if (this.fechaInicioTalento) {
            this.mesIngreso = DateUtil.getMonthName(this.fechaInicioTalento);
        }

        // 5. Closure Month
        if (this.fechaCierreReq) {
            this.mesCierre = DateUtil.getMonthName(this.fechaCierreReq);
        }

        // 6. Lead Time Indicator
        if (this.fechaInicioTalento && this.fechaIngresoSolicitada) {
            this.indicadorLeadTime = this.fechaInicioTalento <= this.fechaIngresoSolicitada ? 'CUMPLE' : 'NO CUMPLE';
        }
    }
}

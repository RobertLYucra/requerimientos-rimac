import { Inject, Injectable } from "@nestjs/common";
import * as cheerio from 'cheerio';
import { StaffingRequestEntity } from "../../domain/entity/staffing-request.entity";
import { RequestType, TeamType } from "../../domain/entity/staffing-request.entity";
import { BiddingCatalogEntity } from "../../domain/entity/bidding-catalog.entity";
import { IStaffingRequestRepository } from "../../domain/repository/staffing-request.repository";
import { IBiddingCatalogRepository } from "../../domain/repository/bidding-catalog.repository";
import { DateUtil } from "src/shared/libs/utils/date.util";

@Injectable()
export class CreateRequerimientoUseCase {
    constructor(
        @Inject("IStaffingRequestRepository")
        private readonly staffingRequestRepository: IStaffingRequestRepository,
        @Inject("IBiddingCatalogRepository")
        private readonly biddingCatalogRepository: IBiddingCatalogRepository
    ) { }

    async createRequest(payload: any) {
        if (!payload.html_body) return null;

        if (payload.subject && payload.subject.includes('CANCELADA') && payload.subject.includes('REQ-')) {
            const match = payload.subject.match(/REQ-(\d+)/);
            if (match) {
                return await this.handleCancellation(match[0]);
            }
        }

        const { data: extractedData, isCancellation } = this.extractDataFromHtml(payload.html_body);

        if (isCancellation && extractedData.codPedido) {
            return await this.handleCancellation(extractedData.codPedido);
        }

        const biddingCategory = await this.resolveBiddingCategory(extractedData.perfil);
        const staffingRequest = await this.createOrUpdateStaffingRequest(extractedData, payload.from, biddingCategory);

        return await this.staffingRequestRepository.save(staffingRequest);
    }

    private async handleCancellation(codPedido: string) {
        const existingRequest = await this.staffingRequestRepository.findByCodPedido(codPedido);
        if (existingRequest) {
            existingRequest.estadoIndra = 'CANCELADO';
            existingRequest.fechaActualizacion = DateUtil.getPeruDate();
            existingRequest.calculateDerivedProperties();
            return await this.staffingRequestRepository.save(existingRequest);
        }
        return null;
    }

    private async resolveBiddingCategory(profileName?: string): Promise<BiddingCatalogEntity | null> {
        if (!profileName) return null;

        const categoryKey = this.determineBiddingCategory(profileName);
        if (!categoryKey) return null;

        const foundCategory = await this.biddingCatalogRepository.findByName(categoryKey);
        if (foundCategory) return foundCategory;

        return await this.biddingCatalogRepository.findByName('OTROS');
    }

    private async createOrUpdateStaffingRequest(
        extractedData: Partial<StaffingRequestEntity>,
        senderEmail: string,
        biddingCategory: BiddingCatalogEntity | null
    ): Promise<StaffingRequestEntity> {
        if (!extractedData.codPedido) {
            return this.createNewStaffingRequest(extractedData, senderEmail, biddingCategory);
        }

        const existingRequest = await this.staffingRequestRepository.findByCodPedido(extractedData.codPedido);

        if (existingRequest) {
            Object.assign(existingRequest, extractedData);
            existingRequest.bidding = biddingCategory || existingRequest.bidding;
            existingRequest.fechaActualizacion = DateUtil.getPeruDate();

            existingRequest.calculateDerivedProperties();

            return existingRequest;
        }

        return this.createNewStaffingRequest(extractedData, senderEmail, biddingCategory);
    }

    private createNewStaffingRequest(
        extractedData: Partial<StaffingRequestEntity>,
        senderEmail: string,
        biddingCategory: BiddingCatalogEntity | null
    ): StaffingRequestEntity {
        const newRequest = this.staffingRequestRepository.create({
            ...extractedData,
            tipoRequerimiento: RequestType.VACIO,
            solicitante: extractedData.solicitante || senderEmail,
            bidding: biddingCategory,
            fechaCreacion: DateUtil.getPeruDate(),
            fechaActualizacion: DateUtil.getPeruDate()
        });

        newRequest.calculateDerivedProperties();

        return newRequest;
    }

    private determineBiddingCategory(profileName: string): string {
        const normalizedProfile = profileName.toUpperCase();

        if (normalizedProfile.includes('BACKEND')) return 'BACKEND';
        if (normalizedProfile.includes('FRONTEND')) return 'FRONTEND';
        if (normalizedProfile.includes('PRUEBAS') || normalizedProfile.includes('QA') || normalizedProfile.includes('CALIDAD')) return 'CALIDAD';
        if (normalizedProfile.includes('CORE') || normalizedProfile.includes('ORACLE') || normalizedProfile.includes('POWER BUILDER')) return 'CORE';
        if (normalizedProfile.includes('ANÁLISIS') || normalizedProfile.includes('ANALISIS') || normalizedProfile.includes('FUNCION') || normalizedProfile.includes('GESTION') || normalizedProfile.includes('PROYECTOS') || normalizedProfile.includes('DISEÑO DE PROCESOS')) return 'ANALISIS Y GESTION';
        if (normalizedProfile.includes('ARQUITECTURA')) return 'ARQUITECTURA';
        if (normalizedProfile.includes('DATA') || normalizedProfile.includes('BI') || normalizedProfile.includes('BIG DATA')) return 'DATA';
        if (normalizedProfile.includes('RPA') || normalizedProfile.includes('AUTOMATIZACIÓN') || normalizedProfile.includes('AUTOMATIZACION') || normalizedProfile.includes('CAMUNDA')) return 'RPA';
        if (normalizedProfile.includes('DEVOPS')) return 'DEVOPS';

        return 'OTROS';
    }

    private extractDataFromHtml(htmlContent: string): { data: Partial<StaffingRequestEntity>, isCancellation: boolean } {
        const $ = cheerio.load(htmlContent);
        const requestData: Partial<StaffingRequestEntity> = {};

        // Detect Cancellation
        const isCancellation = htmlContent.includes('Se ha cancelado la siguente solicitud') ||
            $('div').text().includes('Se ha cancelado la siguente solicitud');

        const tableCells = $('td').toArray();

        for (let i = 0; i < tableCells.length; i++) {
            const cellText = $(tableCells[i]).text().trim();
            const nextCellText = $(tableCells[i]).next('td').text().trim();

            if (cellText.startsWith('REQ-')) {
                requestData.codPedido = cellText;
                if (!requestData.perfil && nextCellText) {
                    requestData.perfil = nextCellText;
                }
            }

            if (cellText.includes('Projecto:')) {
                requestData.proyecto = nextCellText;
            }
            if (cellText.includes('Solicitante:')) {
                requestData.solicitante = nextCellText;
            }
            if (cellText.includes('Comentario:')) {
                requestData.comentarioRimac = nextCellText;
            }
            if (cellText.includes('Fecha Req:')) {
                requestData.fechaIngresoReq = this.parseDate(nextCellText);
            }
            if (cellText.includes('Ingreso Estimado:') || cellText.includes('Fecha estimada de ingreso:')) {
                requestData.fechaIngresoSolicitada = this.parseDate(nextCellText);
            }
            if (cellText.includes('Fin Estimado:')) {
                requestData.fechaCierreReq = this.parseDate(nextCellText);
            }
            if (cellText.includes('Tiempo:')) {
                requestData.tiempoMeses = parseFloat(nextCellText);
            }
        }

        return { data: requestData, isCancellation };
    }

    private parseDate(dateString: string): Date | undefined {
        if (!dateString) return undefined;

        const dateParts = dateString.split('/');
        if (dateParts.length !== 3) return undefined;

        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const year = parseInt(dateParts[2], 10);

        return new Date(year, month, day);
    }
}
import axios from "axios"
import { AxiosResponse } from "axios"
import { 
    tAuthorization, 
    tHeaders, 
    tInvoice, 
    tRespondeSankhya,
    tNewClient,
    tFirstGeneratorLink,
    tFirstInvoice,
    tIssuedInvoice,
    tDueInvoice,
    tOverdueInvoice5Days,
    tOverdueInvoice15Days
} from "../types/sankhya-types"
import { mapResponseToJson } from "../utils/sankhya-utils"
import getMondayLookbackCondition, { getFridayLookaheadCondition, getFridayLookaheadDatediffCondition, getMondayLookbackDatediffCondition } from "../helpers/api-sankhya-helper"

export default class ApiCogni {
    private apiUrl = `${process.env.API_SANKHYA_URL}`
    private headers: tHeaders = {
        token: `${process.env.API_SANKHYA_TOKEN}`,
        appkey: `${process.env.API_SANKHYA_APP_KEY}`,
        username: `${process.env.API_SANKHYA_USERNAME}`,
        password: `${process.env.API_SANKHYA_PASSWORD}`
    }

    constructor() { }

    

    private async auth(): Promise<void> {
        const response: AxiosResponse<tAuthorization> = await axios.post(`${this.apiUrl}/login`, { headers: this.headers });
        this.headers.Authorization = `Bearer ${response.data.bearerToken}`
    }

    private async executeQuery<T = unknown>(sql: string): Promise<T[]> {
        const body = {
            requestBody: {
                sql
            }
        }
        const config = {
            headers: this.headers,
            params: {
                serviceName: `${process.env.API_SANKHYA_SERVICE_NAME}`,
                outputType: 'json'
            }
        };
        let response: AxiosResponse<tRespondeSankhya>;
        try {
            response = await axios.post<tRespondeSankhya>(
                `${this.apiUrl}/gateway/v1/mge/service.sbr`,
                body,
                config
            );

        } catch (error) {
            if (!axios.isAxiosError(error)) {
                throw error;
            }
            if (error.response?.status !== 401) {
                throw error;
            }

            await this.auth();
            
            response = await axios.post<tRespondeSankhya>(
                `${this.apiUrl}/gateway/v1/mge/service.sbr`,
                body,
                config
            );

        }

        return mapResponseToJson<T>(response?.data?.responseBody?.fieldsMetadata, response?.data?.responseBody?.rows);
    }

    async getInvoiceByUcReferenceMonth(uc: string, referenceMonth: number, referenceYear: number): Promise<tInvoice[]> {
        const sql = `
        SELECT  rat.ano, 
                rat.mes, 
                trim(nomeparc)nomeParceiro, 
                trim(fin.historico), 
                format(fin.dtvenc,'dd/MM/yyyy') dtvenc, 
                format(vlrdesdob,'C', 'pt-br') valor, 
                fax telefone,
                trim(email) email, 
                ad_arqrepo linkFatura, 
                CASE 
                    WHEN fin.DHBAIXA IS NOT NULL 
                        THEN 'Pago' 
                    WHEN fin.DHBAIXA IS NULL and DATEDIFF(DAY, fin.DTNEG, GETDATE()) < 180
                        THEN 'Pendente' 
                    WHEN fin.DHBAIXA IS NULL and DATEDIFF(DAY, fin.DTNEG, GETDATE()) >= 180 
                        THEN 'Pendente >180 dias' 
                    ELSE 'Desconhecido' 
                END AS situacao 
        FROM  SANKHYA.TGFFIN fin  
            INNER JOIN SANKHYA.AD_RATHIST rat on rat.codparc=fin.codparc and rat.nroinsta = fin.ad_NROINSTA and rat.NUFIN=fin.NUFIN 
            INNER JOIN TGFPAR par on par.codparc=fin.codparc  
        WHERE  
            recdesp=1 and  
            codnat=1030000 and  
            numremessa is not null and  
            ad_arqrepo is not null and 
            rat.mes = ${referenceMonth} and 
            rat.ano= ${referenceYear} and 
            fin.AD_NROINSTA = '${uc}'
            `
        const result: tInvoice[] = await this.executeQuery(sql);
        return result
    }

    /**
     * NA 100: Novos clientes registrados hoje
     * If Monday: check today + Saturday + Sunday before
     * Otherwise: check today only
     */
    async getNewClientsToday(): Promise<tNewClient[]> {
        const sql = `
        SELECT 
            par.NOMEPARC nomeParceiro,
            par.CGC_CPF cgcCpf,
            FORMAT(ins.DATA_ASSINATURA, 'dd/MM/yyyy') dataAssinatura,
            ins.PERCDESC percentualDesconto,
            par.FAX telefone
        FROM 
            SANKHYA.TGFPAR par
        INNER JOIN 
            SANKHYA.AD_INSTA ins ON par.codparc = ins.codparc AND ins.ATIVO = 'S'
        WHERE 
            ${getMondayLookbackCondition('ins.DATA_ASSINATURA')}
        `
        const result: tNewClient[] = await this.executeQuery(sql);
        return result
    }

    /**
     * NA 200: Primeira vinculação do cliente com Usina geradora
     * 60 days after client registration
     * If Monday: check 60-day diff for today + Saturday + Sunday before
     * Otherwise: check 60-day diff for today only
     */
    async getFirstGeneratorLinks(): Promise<tFirstGeneratorLink[]> {
        const sql = `
        SELECT 
            his.mes,
            his.ano,
            par.NOMEPARC nomeParceiro,
            par.CGC_CPF cgcCpf,
            his.DHINCLUSAO dataInclusao,
            par.FAX telefone
        FROM 
            SANKHYA.AD_RATHIST his
        INNER JOIN 
            SANKHYA.AD_INSTA ins ON his.codparc = ins.codparc
        INNER JOIN 
            SANKHYA.TGFPAR par ON par.codparc = ins.codparc AND ins.ATIVO = 'S'
        WHERE 
            his.codparc IN (
                SELECT codparc 
                FROM SANKHYA.AD_RATHIST 
                GROUP BY codparc, NROINSTA 
                HAVING COUNT(*) = 1
            )
            AND ${getMondayLookbackDatediffCondition('his.DHINCLUSAO', 60)}
        `
        const result: tFirstGeneratorLink[] = await this.executeQuery(sql);
        return result
    }

    /**
     * NA 300: Primeiro boleto
     * First and only invoice, issued and open for the client
     * If Monday: check today + Saturday + Sunday before
     * Otherwise: check today only
     */
    async getFirstInvoices(): Promise<tFirstInvoice[]> {
        const sql = `
        SELECT 
            his.mes,
            his.ano,
            par.NOMEPARC nomeParceiro,
            par.CGC_CPF cgcCpf,
            his.DHINCLUSAO dataInclusao,
            par.FAX telefone,
            fin.ad_arqrepo linkFatura
        FROM 
            SANKHYA.AD_RATHIST his
        INNER JOIN 
            SANKHYA.AD_INSTA ins ON his.codparc = ins.codparc
        INNER JOIN 
            SANKHYA.TGFPAR par ON par.codparc = ins.codparc AND ins.ATIVO = 'S'
        INNER JOIN 
            SANKHYA.TGFFIN fin ON fin.NUFIN = his.NUFIN
        WHERE 
            his.codparc IN (
                SELECT codparc 
                FROM SANKHYA.AD_RATHIST 
                GROUP BY codparc, NROINSTA 
                HAVING COUNT(*) = 1
            )
            AND ${getMondayLookbackCondition('his.DHINCLUSAO')}
            AND fin.DHBAIXA IS NULL
        `
        const result: tFirstInvoice[] = await this.executeQuery(sql);
        return result
    }

    /**
     * NA 400: Quando boleto é emitido e registrado no banco
     * When invoice is issued
     * If Monday: check today + Saturday + Sunday before
     * Otherwise: check today only
     */
    async getIssuedInvoices(): Promise<tIssuedInvoice[]> {
        const sql = `
        SELECT 
            his.mes,
            his.ano,
            par.NOMEPARC nomeParceiro,
            par.CGC_CPF cgcCpf,
            his.DHINCLUSAO dataInclusao,
            par.FAX telefone,
            fin.ad_arqrepo linkFatura,
            FORMAT(fin.DTVENC, 'dd/MM/yyyy') dataVencimento
        FROM 
            SANKHYA.AD_RATHIST his
        INNER JOIN 
            SANKHYA.AD_INSTA ins ON his.codparc = ins.codparc
        INNER JOIN 
            SANKHYA.TGFPAR par ON par.codparc = ins.codparc AND ins.ATIVO = 'S'
        INNER JOIN 
            SANKHYA.TGFFIN fin ON fin.NUFIN = his.NUFIN
        WHERE 
            fin.NUMREMESSA IS NOT NULL
            AND fin.codnat = 1030000
            AND fin.DHBAIXA IS NULL
            AND ${getMondayLookbackCondition('fin.DTNEG')}
        `
        const result: tIssuedInvoice[] = await this.executeQuery(sql);
        return result
    }

    /**
     * NA 500: Quando boleto está vencendo
     * Invoice due date
     * If Friday: check today + Saturday + Sunday after
     * Otherwise: check today only
     */
    async getDueInvoices(): Promise<tDueInvoice[]> {
        const sql = `
        SELECT 
            his.mes,
            his.ano,
            par.NOMEPARC nomeParceiro,
            par.CGC_CPF cgcCpf,
            his.DHINCLUSAO dataInclusao,
            par.FAX telefone,
            fin.ad_arqrepo linkFatura,
            FORMAT(fin.vlrdesdob, 'C', 'pt-br') valor
        FROM 
            SANKHYA.AD_RATHIST his
        INNER JOIN 
            SANKHYA.AD_INSTA ins ON his.codparc = ins.codparc
        INNER JOIN 
            SANKHYA.TGFPAR par ON par.codparc = ins.codparc AND ins.ATIVO = 'S'
        INNER JOIN 
            SANKHYA.TGFFIN fin ON fin.NUFIN = his.NUFIN
        WHERE 
            fin.NUMREMESSA IS NOT NULL
            AND fin.codnat = 1030000
            AND fin.DHBAIXA IS NULL
            AND ${getFridayLookaheadCondition('fin.DTVENC')}
        `
        const result: tDueInvoice[] = await this.executeQuery(sql);
        return result
    }

    /**
     * NA 600: 5 dias após vencimento não pago
     * 5 days after unpaid invoice due date
     * If Friday: check 5-day diff for today + Saturday + Sunday after
     * Otherwise: check 5-day diff for today only
     */
    async getOverdueInvoices5Days(): Promise<tOverdueInvoice5Days[]> {
        const sql = `
        SELECT 
            DATEDIFF(DAY, fin.DTVENC, GETDATE()) diasVencido,
            his.mes,
            his.ano,
            par.NOMEPARC nomeParceiro,
            par.CGC_CPF cgcCpf,
            his.DHINCLUSAO dataInclusao,
            FORMAT(fin.DTVENC, 'dd/MM/yyyy') dataVencimento,
            par.FAX telefone,
            fin.ad_arqrepo linkFatura
        FROM 
            SANKHYA.AD_RATHIST his
        INNER JOIN 
            SANKHYA.AD_INSTA ins ON his.codparc = ins.codparc
        INNER JOIN 
            SANKHYA.TGFPAR par ON par.codparc = ins.codparc AND ins.ATIVO = 'S'
        INNER JOIN 
            SANKHYA.TGFFIN fin ON fin.NUFIN = his.NUFIN
        WHERE 
            fin.NUMREMESSA IS NOT NULL
            AND fin.codnat = 1030000
            AND fin.DHBAIXA IS NULL
            AND ${getFridayLookaheadDatediffCondition('fin.DTVENC', 5)}
        ORDER BY diasVencido
        `
        const result: tOverdueInvoice5Days[] = await this.executeQuery(sql);
        return result
    }

    /**
     * NA 700: 15 dias após vencimento não pago
     * 15 days after unpaid invoice due date
     * If Friday: check 15-day diff for today + Saturday + Sunday after
     * Otherwise: check 15-day diff for today only
     */
    async getOverdueInvoices15Days(): Promise<tOverdueInvoice15Days[]> {
        const sql = `
        SELECT 
            DATEDIFF(DAY, fin.DTVENC, GETDATE()) diasVencido,
            his.mes,
            his.ano,
            par.NOMEPARC nomeParceiro,
            par.CGC_CPF cgcCpf,
            his.DHINCLUSAO dataInclusao,
            FORMAT(fin.DTVENC, 'dd/MM/yyyy') dataVencimento,
            par.FAX telefone,
            fin.ad_arqrepo linkFatura
        FROM 
            SANKHYA.AD_RATHIST his
        INNER JOIN 
            SANKHYA.AD_INSTA ins ON his.codparc = ins.codparc
        INNER JOIN 
            SANKHYA.TGFPAR par ON par.codparc = ins.codparc AND ins.ATIVO = 'S'
        INNER JOIN 
            SANKHYA.TGFFIN fin ON fin.NUFIN = his.NUFIN
        WHERE 
            fin.NUMREMESSA IS NOT NULL
            AND fin.codnat = 1030000
            AND fin.DHBAIXA IS NULL
            AND ${getFridayLookaheadDatediffCondition('fin.DTVENC', 15)}
        ORDER BY diasVencido
        `
        const result: tOverdueInvoice15Days[] = await this.executeQuery(sql);
        return result
    }

}
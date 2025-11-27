import axios from "axios"
import { AxiosResponse } from "axios"
import { tAuthorization, tHeaders, tInvoice, tRespondeSankhya } from "../types/sankhya-types"
import { mapResponseToJson } from "../utils/sankhya-utils"

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
                fax whatsapp,trim(email) email, 
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



}
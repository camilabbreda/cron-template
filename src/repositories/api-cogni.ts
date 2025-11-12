import axios from "axios"
import { AxiosResponse } from "axios"
import { CogniResponse, Company, Invoice } from "../types/cogni-type"

export default class ApiCogni {
    private apiUrl
    private headers: {
        API_KEY: string
        API_SECRET: string
    } | undefined


    constructor() {
        this.apiUrl = process.env.API_COGNI_URL
        this.headers = {
            API_KEY: `${process.env.API_COGNI_KEY}`,
            API_SECRET: `${process.env.API_COGNI_SECRET}`
        }
    }

    async getCompanies(page_number: number): Promise<{ companies: Company[] }> {
        const response: AxiosResponse<CogniResponse<Company>> = await axios.get(`${this.apiUrl}/invoice/companies`, { headers: this.headers, params: { page_number } });
        return { companies: response?.data?.registers}
    }

    async getTotalPages(page_number: number): Promise<{totalPages: number }> {
        const response: AxiosResponse<CogniResponse<Company>> = await axios.get(`${this.apiUrl}/invoice/companies`, { headers: this.headers, params: { page_number } });
        return { totalPages: response?.data?.total_pages }
    }

    async getInvoice(uc_number: string, referente_month?: string): Promise<{ invoices: Invoice[], totalPages: number }> {
        const response: AxiosResponse<CogniResponse<Invoice>> = await axios.get(`${this.apiUrl}/invoice/invoice_bill`,
            {
                headers: this.headers,
                params: { uc_number, referente_month }
            });
        return { invoices: response?.data?.registers, totalPages: response?.data?.total_pages }
    }

}
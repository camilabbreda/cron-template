import ApiCogni from "../repositories/api-cogni";
import ApiBlip from "../repositories/api-blip";
import * as invoiceService from "../services/invoice-service";
import * as companyUtils from "../utils/company-utils";
import * as invoiceUtils from "../utils/invoice-utils";
import { Company, Invoice } from "../types/cogni-type";
import { processAllNotifications } from "../services/notification-service";
import { CampaignData, responseBlip } from "../types/blip-types";


jest.mock("../repositories/api-cogni");
jest.mock("../repositories/api-blip");

describe("notification-service", () => {
    let mockApiCogni: jest.Mocked<ApiCogni>;
    let mockApiBlip: jest.Mocked<ApiBlip>;

    beforeEach(() => {
        mockApiCogni = new ApiCogni() as jest.Mocked<ApiCogni>;
        mockApiBlip = new ApiBlip() as jest.Mocked<ApiBlip>;
        jest.clearAllMocks();
        jest.spyOn(ApiBlip.prototype, "postWhatsappNotificationMessage").mockResolvedValue({ status: "success" } as responseBlip);

    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });


    it('Post notification for na100_novos_clientes_2', async () => {
        jest.useFakeTimers({ now: new Date("2025-10-20 00:00:000.00") });
        const mockCompanies: Company[] = [
            {
                active: 'True',
                contact_phone: '5548991516768',
                created_at: '2025-10-20 00:00:000.00',
                uc_number: 'UC123',
            }
        ]
        const mockCampaignData: CampaignData = {
            phone: '+' + mockCompanies[0].contact_phone,
            campaignName: `${process.env.TEMPLATE_NA100_NAME}`,
            stateId: `${process.env.TEMPLATE_NA100_STATEID}`,
            templateName: `${process.env.TEMPLATE_NA100_NAME}`,
            audience: { messageParams: null, },
            message: { messageParams: null },
        }
        jest.spyOn(ApiCogni.prototype, "getCompanies").mockResolvedValueOnce({
            companies: mockCompanies,
            totalPages: 1,
        });

        jest.spyOn(invoiceService, 'processInvoice').mockResolvedValue([{ action: null, doc: null }]);
        jest.spyOn(invoiceUtils, 'extractInvoiceData').mockReturnValue(null);
        jest.spyOn(companyUtils, 'verifyNewClient').mockReturnValue({ action: "NA 100 Novos clientes", doc: null });

        const result = await processAllNotifications()

        expect(result).toEqual({
            errorList: [],
            successList: [expect.objectContaining({ campaignData: expect.objectContaining(mockCampaignData) })],
            notificationQuantity: 1
        });
    })

    it('Post notification for na200_usina_ativacao', async () => {
        jest.useFakeTimers({ now: new Date("2025-10-20 00:00:000.00") });
        const mockCompanies: Company[] = [
            {
                active: 'True',
                contact_phone: '5548991516768',
                created_at: '2025-08-21 00:00:000.00',
                uc_number: 'UC123',
            }
        ]


        const mockCampaignData: CampaignData = {
            phone: '+' + mockCompanies[0].contact_phone,
            campaignName: `${process.env.TEMPLATE_NA200_NAME}`,
            stateId: `${process.env.TEMPLATE_NA200_STATEID}`,
            templateName: `${process.env.TEMPLATE_NA200_NAME}`,
            audience: { messageParams: null, },
            message: { messageParams: null },
        }
        jest.spyOn(ApiCogni.prototype, "getCompanies").mockResolvedValueOnce({
            companies: mockCompanies,
            totalPages: 1,
        });
        jest.spyOn(companyUtils, 'verifyNewClient').mockReturnValue({ action: "NA 200 Usina ativação", doc: null });
        jest.spyOn(invoiceService, 'processInvoice').mockResolvedValue([{ action: null, doc: null }]);
        jest.spyOn(invoiceUtils, 'extractInvoiceData').mockReturnValue(null);

        const result = await processAllNotifications()

        expect(result).toEqual({
            errorList: [],
            successList: [expect.objectContaining({ campaignData: expect.objectContaining(mockCampaignData) })],
            notificationQuantity: 1
        });
    })

    it('Post notification for na300_primeiro_boleto', async () => {
        jest.useFakeTimers({ now: new Date("2025-10-20 00:00:000.00") });
        const mockCompanies: Company[] = [
            {
                active: 'True',
                contact_phone: '5548991516768',
                created_at: '2025-08-15 00:00:000.00',
                uc_number: 'UC123',
            }
        ]

        const invoice: Invoice = {
            invoice_due_date: '2025-10-25 00:00:000.00',
            invoice_emission_date: "2025-10-15 00:00:000.00",
            invoice_save_s3_html: "44908901_2025-10-02T12-27-33.html",
            invoice_status: 3,
            value: 108.70988509100002,
            invoice_json_response: {
                payload: {
                    resultado: {
                        dataEmissao: "2025-10-02",
                        dataVencimento: "2025-10-17",
                        valor: 108.71
                    }
                }
            }

        }

        const mockCampaignData: CampaignData = {
            phone: '+' + mockCompanies[0].contact_phone,
            campaignName: `${process.env.TEMPLATE_NA300_NAME}`,
            stateId: `${process.env.TEMPLATE_NA300_STATEID}`,
            templateName: `${process.env.TEMPLATE_NA300_NAME}`,
            audience: { messageParams: { "1": invoice.invoice_save_s3_html } },
            message: { messageParams: ["1"] },
        }
        jest.spyOn(ApiCogni.prototype, "getCompanies").mockResolvedValueOnce({
            companies: mockCompanies,
            totalPages: 1,
        });
        jest.spyOn(companyUtils, 'verifyNewClient').mockReturnValue({ action: null, doc: null });

        jest.spyOn(invoiceService, 'processInvoice').mockResolvedValue([{ action: 'NA 300 Primeiro boleto', doc: invoice }]);

        const result = await processAllNotifications()

        expect(result).toEqual({
            errorList: [],
            successList: [expect.objectContaining({ campaignData: expect.objectContaining(mockCampaignData) })],
            notificationQuantity: 1
        });
    })

    it('Post notification for na400_envio_de_boleto', async () => {
        jest.useFakeTimers({ now: new Date("2025-10-20 00:00:000.00") });
        const mockCompanies: Company[] = [
            {
                active: 'True',
                contact_phone: '48991516768',
                created_at: '2025-08-15 00:00:000.00',
                uc_number: 'UC123',
            }
        ]

        const invoice: Invoice = {
            invoice_due_date: '2025-10-25 00:00:000.00',
            invoice_emission_date: "2025-10-15 00:00:000.00",
            invoice_save_s3_html: "44908901_2025-10-02T12-27-33.html",
            invoice_status: 3,
            value: 108.70988509100002,
            invoice_json_response: {
                payload: {
                    resultado: {
                        dataEmissao: "2025-10-02",
                        dataVencimento: "2025-10-17",
                        valor: 108.71
                    }
                }
            }

        }

        const mockCampaignData: CampaignData = {
            phone: '+55' + mockCompanies[0].contact_phone,
            campaignName: `${process.env.TEMPLATE_NA400_NAME}`,
            stateId: `${process.env.TEMPLATE_NA400_STATEID}`,
            templateName: `${process.env.TEMPLATE_NA400_NAME}`,
            audience: { messageParams: { "1": invoice.invoice_save_s3_html, "2": "17-10-2025" } },
            message: { messageParams: ["1", "2"] },
        }
        jest.spyOn(ApiCogni.prototype, "getCompanies").mockResolvedValueOnce({
            companies: mockCompanies,
            totalPages: 1,
        });
        jest.spyOn(companyUtils, 'verifyNewClient').mockReturnValue({ action: null, doc: null });
        jest.spyOn(invoiceService, 'processInvoice').mockResolvedValue([{ action: 'NA 400 Envio de boleto', doc: invoice }]);

        const result = await processAllNotifications()

        expect(result).toEqual({
            errorList: [],
            successList: [expect.objectContaining({ campaignData: expect.objectContaining(mockCampaignData) })],
            notificationQuantity: 1
        });
    })

    it('Post notification for na500_envio_de_boleto', async () => {
        jest.useFakeTimers({ now: new Date("2025-10-20 00:00:000.00") });
        const mockCompanies: Company[] = [
            {
                active: 'True',
                contact_phone: '48991516768',
                created_at: '2025-08-15 00:00:000.00',
                uc_number: 'UC123',
            }
        ]

        const invoice: Invoice = {
            invoice_due_date: '2025-10-25 00:00:000.00',
            invoice_emission_date: "2025-10-15 00:00:000.00",
            invoice_save_s3_html: "44908901_2025-10-02T12-27-33.html",
            invoice_status: 3,
            value: 108.70988509100002,
            invoice_json_response: {
                payload: {
                    resultado: {
                        dataEmissao: "2025-10-02",
                        dataVencimento: "2025-10-17",
                        valor: 108.71
                    }
                }
            }

        }

        const mockCampaignData: CampaignData = {
            phone: '+55' + mockCompanies[0].contact_phone,
            campaignName: `${process.env.TEMPLATE_NA500_NAME}`,
            stateId: `${process.env.TEMPLATE_NA500_STATEID}`,
            templateName: `${process.env.TEMPLATE_NA500_NAME}`,
            audience: { messageParams: { "1": invoice.invoice_save_s3_html, "2": "108,71" }, },
            message: { messageParams: ["1", "2"] },
        }
        jest.spyOn(ApiCogni.prototype, "getCompanies").mockResolvedValueOnce({
            companies: mockCompanies,
            totalPages: 1,
        });

        jest.spyOn(invoiceService, 'processInvoice').mockResolvedValue([{ action: 'NA 500 Envio de boleto', doc: invoice }]);
        jest.spyOn(companyUtils, 'verifyNewClient').mockReturnValue({ action: null, doc: null });
        const result = await processAllNotifications()

        expect(result).toEqual({
            errorList: [],
            successList: [expect.objectContaining({ campaignData: expect.objectContaining(mockCampaignData) })],
            notificationQuantity: 1
        });
    })

    it('Post notification for na600_envio_de_boleto', async () => {
        jest.useFakeTimers({ now: new Date("2025-10-20 00:00:000.00") });
        const mockCompanies: Company[] = [
            {
                active: 'True',
                contact_phone: '48991516768',
                created_at: '2025-08-15 00:00:000.00',
                uc_number: 'UC123',
            }
        ]

        const invoice: Invoice = {
            invoice_due_date: '2025-10-25 00:00:000.00',
            invoice_emission_date: "2025-10-15 00:00:000.00",
            invoice_save_s3_html: "44908901_2025-10-02T12-27-33.html",
            invoice_status: 3,
            value: 108.70988509100002,
            invoice_json_response: {
                payload: {
                    resultado: {
                        dataEmissao: "2025-10-02",
                        dataVencimento: "2025-10-17",
                        valor: 108.71
                    }
                }
            }

        }

        const mockCampaignData: CampaignData = {
            phone: '+55' + mockCompanies[0].contact_phone,
            campaignName: `${process.env.TEMPLATE_NA600_NAME}`,
            stateId: `${process.env.TEMPLATE_NA600_STATEID}`,
            templateName: `${process.env.TEMPLATE_NA600_NAME}`,
            audience: { messageParams: {"1":"17-10-2025", idBoletoCampanha: "44908901_2025-10-02T12-27-33.html" }, },
            message: { messageParams: ["1"] },
        }
        jest.spyOn(ApiCogni.prototype, "getCompanies").mockResolvedValueOnce({
            companies: mockCompanies,
            totalPages: 1,
        });

        jest.spyOn(invoiceService, 'processInvoice').mockResolvedValue([{ action: 'NA 600 Envio de boleto', doc: invoice }]);
        jest.spyOn(companyUtils, 'verifyNewClient').mockReturnValue({ action: null, doc: null });
        const result = await processAllNotifications()

        expect(result).toEqual({
            errorList: [],
            successList: [expect.objectContaining({ campaignData: expect.objectContaining(mockCampaignData) })],
            notificationQuantity: 1
        });
    })

    it('Post notification for na700_envio_de_boleto', async () => {
        jest.useFakeTimers({ now: new Date("2025-10-20 00:00:000.00") });
        const mockCompanies: Company[] = [
            {
                active: 'True',
                contact_phone: '48991516768',
                created_at: '2025-08-15 00:00:000.00',
                uc_number: 'UC123',
            }
        ]

        const invoice: Invoice = {
            invoice_due_date: '2025-10-25 00:00:000.00',
            invoice_emission_date: "2025-10-15 00:00:000.00",
            invoice_save_s3_html: "44908901_2025-10-02T12-27-33.html",
            invoice_status: 3,
            value: 108.70988509100002,
            invoice_json_response: {
                payload: {
                    resultado: {
                        dataEmissao: "2025-10-02",
                        dataVencimento: "2025-10-17",
                        valor: 108.71
                    }
                }
            }

        }

        const mockCampaignData: CampaignData = {
            phone: '+55' + mockCompanies[0].contact_phone,
            campaignName: `${process.env.TEMPLATE_NA700_NAME}`,
            stateId: `${process.env.TEMPLATE_NA700_STATEID}`,
            templateName: `${process.env.TEMPLATE_NA700_NAME}`,
            audience: { messageParams: {idBoletoCampanha: "44908901_2025-10-02T12-27-33.html"}, },
            message: { messageParams: null },
        }
        jest.spyOn(ApiCogni.prototype, "getCompanies").mockResolvedValueOnce({
            companies: mockCompanies,
            totalPages: 1,
        });

        jest.spyOn(invoiceService, 'processInvoice').mockResolvedValue([{ action: 'NA 700 Envio de boleto', doc: invoice }]);
        jest.spyOn(companyUtils, 'verifyNewClient').mockReturnValue({ action: null, doc: null });
        const result = await processAllNotifications()

        expect(result).toEqual({
            errorList: [],
            successList: [expect.objectContaining({ campaignData: expect.objectContaining(mockCampaignData) })],
            notificationQuantity: 1
        });
    })

})
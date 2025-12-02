import ApiSankhya from '../repositories/api-sankhya';
import ApiBlip from '../repositories/api-blip';
import { handleServiceError } from '../utils/error-handler';
import { ServiceError } from '../types/error-types';
import { CampaignData, responseBlip } from '../types/blip-types';
import { validatePhone } from '../utils/phone-utils';
import { obtainSankhyaNotificatioLinkComplement, removeTextFromValue } from '../utils/invoice-utils';

type SankhyaNotificationResult = {
    errorList: ServiceError[];
    successList: { campaignData: CampaignData; blipResponse: responseBlip; phone: string }[];
    notificationQuantity: number;
};

/**
 * Main orchestrator: Process all Sankhya notifications (NA 100-700)
 * Single sequential execution for all 7 notification types
 * Better performance than multiple crons and avoids overlap
 */
export async function processAllSankhyaNotifications(): Promise<SankhyaNotificationResult> {
    const errorList: ServiceError[] = [];
    const successList: { campaignData: CampaignData; blipResponse: responseBlip; phone: string }[] = [];
    const notificationDetails = [];
    let notificationQuantity = 0;

    try {
        console.log(
            '[Sankhya Notification] Starting cron job for Sankhya notification execution',
            new Date().toISOString()
        );

        const apiSankhya = new ApiSankhya();
        const apiBlip = new ApiBlip();

        // Process all notification types sequentially
        const na100Results = await processNA100(apiSankhya, apiBlip, errorList);
        notificationDetails.push({ campaign: na100Results[0]?.campaignData.campaignName, count: na100Results.length });
        successList.push(...na100Results);
        notificationQuantity += na100Results.length;

        const na200Results = await processNA200(apiSankhya, apiBlip, errorList);
        notificationDetails.push({ campaign: na200Results[0]?.campaignData.campaignName, count: na200Results.length });
        successList.push(...na200Results);
        notificationQuantity += na200Results.length;

        const na300Results = await processNA300(apiSankhya, apiBlip, errorList);
        notificationDetails.push({ campaign: na300Results[0]?.campaignData.campaignName, count: na300Results.length });
        successList.push(...na300Results);
        notificationQuantity += na300Results.length;

        const na400Results = await processNA400(apiSankhya, apiBlip, errorList);
        notificationDetails.push({ campaign: na400Results[0]?.campaignData.campaignName, count: na400Results.length });
        successList.push(...na400Results);
        notificationQuantity += na400Results.length;

        const na500Results = await processNA500(apiSankhya, apiBlip, errorList);
        notificationDetails.push({ campaign: na500Results[0]?.campaignData.campaignName, count: na500Results.length });
        successList.push(...na500Results);
        notificationQuantity += na500Results.length;

        const na600Results = await processNA600(apiSankhya, apiBlip, errorList);
        notificationDetails.push({ campaign: na600Results[0]?.campaignData.campaignName, count: na600Results.length });
        successList.push(...na600Results);
        notificationQuantity += na600Results.length;

        const na700Results = await processNA700(apiSankhya, apiBlip, errorList);
        notificationDetails.push({ campaign: na700Results[0]?.campaignData.campaignName, count: na700Results.length });
        successList.push(...na700Results);
        notificationQuantity += na700Results.length;

        console.log(
            '[Sankhya Notification] Finished cron job for Sankhya notification execution',
            new Date().toISOString()
        );
    } catch (error) {
        const err = handleServiceError(error, 'Sankhya notification orchestration');
        errorList.push(err);
        console.error(err);
    }

    return { errorList, successList, notificationQuantity };
}

/**
 * Build campaign data for Sankhya notifications
 * Handles NA 100-700 notification types
 */
function buildSankhyaCampaignData(
    action: string,
    phone: string,
    invoiceData?: { linkFatura?: string; dataVencimento?: string; valor?: string } | null
): CampaignData | null {
    if (!phone) return null;

    switch (action) {
        case 'NA 100 Novos clientes': {
            return {
                phone,
                campaignName: `${process.env.TEMPLATE_NA100_NAME}`,
                stateId: `${process.env.TEMPLATE_NA100_STATEID}`,
                templateName: `${process.env.TEMPLATE_NA100_NAME}`,
                audience: { messageParams: null },
                message: { messageParams: null },
            };
        }

        case 'NA 200 Usina ativação': {
            return {
                phone,
                campaignName: `${process.env.TEMPLATE_NA200_NAME}`,
                stateId: `${process.env.TEMPLATE_NA200_STATEID}`,
                templateName: `${process.env.TEMPLATE_NA200_NAME}`,
                audience: { messageParams: null },
                message: { messageParams: null },
            };
        }

        case 'NA 300 Primeiro boleto': {
            return {
                phone,
                campaignName: `${process.env.TEMPLATE_SANKHYA_NA300_NAME}`,
                stateId: `${process.env.TEMPLATE_NA300_STATEID}`,
                templateName: `${process.env.TEMPLATE_SANKHYA_NA300_NAME}`,
                audience: { messageParams: { '1': invoiceData?.linkFatura } },
                message: { messageParams: ['1'] },
            };
        }

        case 'NA 400 Envio de boleto': {
            return {
                phone,
                campaignName: `${process.env.TEMPLATE_SANKHYA_NA400_NAME}`,
                stateId: `${process.env.TEMPLATE_NA400_STATEID}`,
                templateName: `${process.env.TEMPLATE_SANKHYA_NA400_NAME}`,
                audience: {
                    messageParams: {
                        '1': invoiceData?.linkFatura,
                        '2': invoiceData?.dataVencimento,
                    },
                },
                message: { messageParams: ['1', '2'] },
            };
        }

        case 'NA 500 Envio de boleto': {
            return {
                phone,
                campaignName: `${process.env.TEMPLATE_SANKHYA_NA500_NAME}`,
                stateId: `${process.env.TEMPLATE_NA500_STATEID}`,
                templateName: `${process.env.TEMPLATE_SANKHYA_NA500_NAME}`,
                audience: {
                    messageParams: {
                        '1': invoiceData?.linkFatura,
                        '2': invoiceData?.valor,
                    },
                },
                message: { messageParams: ['1', '2'] },
            };
        }

        case 'NA 600 Envio de boleto': {
            return {
                phone,
                campaignName: `${process.env.TEMPLATE_NA600_NAME}`,
                stateId: `${process.env.TEMPLATE_SANKHYA_NA600_STATEID}`,
                templateName: `${process.env.TEMPLATE_NA600_NAME}`,
                audience: {
                    messageParams: {
                        '1': invoiceData?.dataVencimento,
                        idBoletoCampanha: invoiceData?.linkFatura,
                    },
                },
                message: { messageParams: ['1'] },
            };
        }

        case 'NA 700 Envio de boleto': {
            return {
                phone,
                campaignName: `${process.env.TEMPLATE_NA700_NAME}`,
                stateId: `${process.env.TEMPLATE_SANKHYA_NA700_STATEID}`,
                templateName: `${process.env.TEMPLATE_NA700_NAME}`,
                audience: {
                    messageParams: {
                        idBoletoCampanha: invoiceData?.linkFatura,
                    },
                },
                message: { messageParams: null },
            };
        }

        default:
            return null;
    }
}

/**
 * Process NA 100: Novos clientes
 */
async function processNA100(
    apiSankhya: ApiSankhya,
    apiBlip: ApiBlip,
    errorList: ServiceError[]
): Promise<{ campaignData: CampaignData; blipResponse: responseBlip; phone: string }[]> {
    const successList: { campaignData: CampaignData; blipResponse: responseBlip; phone: string }[] = [];
    try {
        const clients = await apiSankhya.getNewClientsToday();
        for (const client of clients) {
            try {
                const validPhone = validatePhone(client.telefone);
                if (!validPhone) continue;

                const campaignData = buildSankhyaCampaignData('NA 100 Novos clientes', validPhone);
                if (!campaignData) continue;

                const blipResponse = await apiBlip.postWhatsappNotificationMessage(campaignData);
                if (blipResponse?.status !== 'success') {
                    errorList.push({
                        context: 'blip notification failure',
                        message: 'NA 100 notification failure',
                        type: 'GeneralError',
                        data: blipResponse,
                        ucNumber: client.cgcCpf,
                    });
                    continue;
                }
                successList.push({ campaignData, blipResponse, phone: validPhone });
            } catch (error) {
                const err = handleServiceError(error, 'NA 100 send notification', client.cgcCpf);
                errorList.push(err);
                console.error(err);
            }
        }
    } catch (error) {
        const err = handleServiceError(error, 'NA 100 fetch new clients');
        errorList.push(err);
        console.error(err);
    }
    return successList;
}

/**
 * Process NA 200: Usina ativação
 */
async function processNA200(
    apiSankhya: ApiSankhya,
    apiBlip: ApiBlip,
    errorList: ServiceError[]
): Promise<{ campaignData: CampaignData; blipResponse: responseBlip; phone: string }[]> {
    const successList: { campaignData: CampaignData; blipResponse: responseBlip; phone: string }[] = [];
    try {
        const links = await apiSankhya.getFirstGeneratorLinks();
        for (const link of links) {
            try {
                const validPhone = validatePhone(link.telefone);
                if (!validPhone) continue;

                const campaignData = buildSankhyaCampaignData('NA 200 Usina ativação', validPhone);
                if (!campaignData) continue;

                const blipResponse = await apiBlip.postWhatsappNotificationMessage(campaignData);
                if (blipResponse?.status !== 'success') {
                    errorList.push({
                        context: 'blip notification failure',
                        message: 'NA 200 notification failure',
                        type: 'GeneralError',
                        data: blipResponse,
                        ucNumber: link.cgcCpf,
                    });
                    continue;
                }
                successList.push({ campaignData, blipResponse, phone: validPhone });
            } catch (error) {
                const err = handleServiceError(error, 'NA 200 send notification', link.cgcCpf);
                errorList.push(err);
                console.error(err);
            }
        }
    } catch (error) {
        const err = handleServiceError(error, 'NA 200 fetch first generator links');
        errorList.push(err);
        console.error(err);
    }
    return successList;
}

/**
 * Process NA 300: Primeiro boleto
 */
async function processNA300(
    apiSankhya: ApiSankhya,
    apiBlip: ApiBlip,
    errorList: ServiceError[]
): Promise<{ campaignData: CampaignData; blipResponse: responseBlip; phone: string }[]> {
    const successList: { campaignData: CampaignData; blipResponse: responseBlip; phone: string }[] = [];
    try {
        const invoices = await apiSankhya.getFirstInvoices();
        for (const invoice of invoices) {
            try {
                const validPhone = validatePhone(invoice.telefone);
                if (!validPhone) continue;
                const linkFatura = obtainSankhyaNotificatioLinkComplement(invoice.linkFatura);
                if (!linkFatura) continue;
                const invoiceData = { linkFatura };
                const campaignData = buildSankhyaCampaignData('NA 300 Primeiro boleto', validPhone, invoiceData);
                if (!campaignData) continue;

                const blipResponse = await apiBlip.postWhatsappNotificationMessage(campaignData);
                if (blipResponse?.status !== 'success') {
                    errorList.push({
                        context: 'blip notification failure',
                        message: 'NA 300 notification failure',
                        type: 'GeneralError',
                        data: blipResponse,
                        ucNumber: invoice.cgcCpf,
                    });
                    continue;
                }
                successList.push({ campaignData, blipResponse, phone: validPhone });
            } catch (error) {
                const err = handleServiceError(error, 'NA 300 send notification', invoice.cgcCpf);
                errorList.push(err);
                console.error(err);
            }
        }
    } catch (error) {
        const err = handleServiceError(error, 'NA 300 fetch first invoices');
        errorList.push(err);
        console.error(err);
    }
    return successList;
}

/**
 * Process NA 400: Envio de boleto (emitido)
 */
async function processNA400(
    apiSankhya: ApiSankhya,
    apiBlip: ApiBlip,
    errorList: ServiceError[]
): Promise<{ campaignData: CampaignData; blipResponse: responseBlip; phone: string }[]> {
    const successList: { campaignData: CampaignData; blipResponse: responseBlip; phone: string }[] = [];
    try {
        const invoices = await apiSankhya.getIssuedInvoices();
        for (const invoice of invoices) {
            try {
                const validPhone = validatePhone(invoice.telefone);
                if (!validPhone) continue;
                const linkFatura = obtainSankhyaNotificatioLinkComplement(invoice.linkFatura);
                if (!linkFatura) continue;
                const invoiceData = {
                    linkFatura,
                    dataVencimento: invoice.dataVencimento,
                };
                const campaignData = buildSankhyaCampaignData('NA 400 Envio de boleto', validPhone, invoiceData);
                if (!campaignData) continue;

                const blipResponse = await apiBlip.postWhatsappNotificationMessage(campaignData);
                if (blipResponse?.status !== 'success') {
                    errorList.push({
                        context: 'blip notification failure',
                        message: 'NA 400 notification failure',
                        type: 'GeneralError',
                        data: blipResponse,
                        ucNumber: invoice.cgcCpf,
                    });
                    continue;
                }
                successList.push({ campaignData, blipResponse, phone: validPhone });
            } catch (error) {
                const err = handleServiceError(error, 'NA 400 send notification', invoice.cgcCpf);
                errorList.push(err);
                console.error(err);
            }
        }
    } catch (error) {
        const err = handleServiceError(error, 'NA 400 fetch issued invoices');
        errorList.push(err);
        console.error(err);
    }
    return successList;
}

/**
 * Process NA 500: Envio de boleto (vencendo)
 */
async function processNA500(
    apiSankhya: ApiSankhya,
    apiBlip: ApiBlip,
    errorList: ServiceError[]
): Promise<{ campaignData: CampaignData; blipResponse: responseBlip; phone: string }[]> {
    const successList: { campaignData: CampaignData; blipResponse: responseBlip; phone: string }[] = [];
    try {
        const invoices = await apiSankhya.getDueInvoices();
        for (const invoice of invoices) {
            try {
                const validPhone = validatePhone(invoice.telefone);
                if (!validPhone) continue;
                const linkFatura = obtainSankhyaNotificatioLinkComplement(invoice.linkFatura);
                if (!linkFatura) continue;
                const valor = removeTextFromValue(invoice.valor);
                if (!valor) continue;
                const invoiceData = {
                    linkFatura,
                    valor,
                };
                const campaignData = buildSankhyaCampaignData('NA 500 Envio de boleto', validPhone, invoiceData);
                if (!campaignData) continue;

                const blipResponse = await apiBlip.postWhatsappNotificationMessage(campaignData);
                if (blipResponse?.status !== 'success') {
                    errorList.push({
                        context: 'blip notification failure',
                        message: 'NA 500 notification failure',
                        type: 'GeneralError',
                        data: blipResponse,
                        ucNumber: invoice.cgcCpf,
                    });
                    continue;
                }
                successList.push({ campaignData, blipResponse, phone: validPhone });
            } catch (error) {
                const err = handleServiceError(error, 'NA 500 send notification', invoice.cgcCpf);
                errorList.push(err);
                console.error(err);
            }
        }
    } catch (error) {
        const err = handleServiceError(error, 'NA 500 fetch due invoices');
        errorList.push(err);
        console.error(err);
    }
    return successList;
}

/**
 * Process NA 600: Envio de boleto (5 dias vencido)
 */
async function processNA600(
    apiSankhya: ApiSankhya,
    apiBlip: ApiBlip,
    errorList: ServiceError[]
): Promise<{ campaignData: CampaignData; blipResponse: responseBlip; phone: string }[]> {
    const successList: { campaignData: CampaignData; blipResponse: responseBlip; phone: string }[] = [];
    try {
        const invoices = await apiSankhya.getOverdueInvoices5Days();
        for (const invoice of invoices) {
            try {
                const validPhone = validatePhone(invoice.telefone);
                if (!validPhone) continue;
                const linkFatura = obtainSankhyaNotificatioLinkComplement(invoice.linkFatura);
                if (!linkFatura) continue;
                const invoiceData = {
                    linkFatura,
                    dataVencimento: invoice.dataVencimento,
                };
                const campaignData = buildSankhyaCampaignData('NA 600 Envio de boleto', validPhone, invoiceData);
                if (!campaignData) continue;

                const blipResponse = await apiBlip.postWhatsappNotificationMessage(campaignData);
                if (blipResponse?.status !== 'success') {
                    errorList.push({
                        context: 'blip notification failure',
                        message: 'NA 600 notification failure',
                        type: 'GeneralError',
                        data: blipResponse,
                        ucNumber: invoice.cgcCpf,
                    });
                    continue;
                }
                successList.push({ campaignData, blipResponse, phone: validPhone });
            } catch (error) {
                const err = handleServiceError(error, 'NA 600 send notification', invoice.cgcCpf);
                errorList.push(err);
                console.error(err);
            }
        }
    } catch (error) {
        const err = handleServiceError(error, 'NA 600 fetch overdue 5 days invoices');
        errorList.push(err);
        console.error(err);
    }
    return successList;
}

/**
 * Process NA 700: Envio de boleto (15 dias vencido)
 */
async function processNA700(
    apiSankhya: ApiSankhya,
    apiBlip: ApiBlip,
    errorList: ServiceError[]
): Promise<{ campaignData: CampaignData; blipResponse: responseBlip; phone: string }[]> {
    const successList: { campaignData: CampaignData; blipResponse: responseBlip; phone: string }[] = [];
    try {
        const invoices = await apiSankhya.getOverdueInvoices15Days();
        for (const invoice of invoices) {
            try {
                const validPhone = validatePhone(invoice.telefone);
                if (!validPhone) continue;
                const linkFatura = obtainSankhyaNotificatioLinkComplement(invoice.linkFatura);
                if (!linkFatura) continue;
                const invoiceData = {
                    linkFatura,
                };
                const campaignData = buildSankhyaCampaignData('NA 700 Envio de boleto', validPhone, invoiceData);
                if (!campaignData) continue;

                const blipResponse = await apiBlip.postWhatsappNotificationMessage(campaignData);
                if (blipResponse?.status !== 'success') {
                    errorList.push({
                        context: 'blip notification failure',
                        message: 'NA 700 notification failure',
                        type: 'GeneralError',
                        data: blipResponse,
                        ucNumber: invoice.cgcCpf,
                    });
                    continue;
                }
                successList.push({ campaignData, blipResponse, phone: validPhone });
            } catch (error) {
                const err = handleServiceError(error, 'NA 700 send notification', invoice.cgcCpf);
                errorList.push(err);
                console.error(err);
            }
        }
    } catch (error) {
        const err = handleServiceError(error, 'NA 700 fetch overdue 15 days invoices');
        errorList.push(err);
        console.error(err);
    }
    return successList;
}



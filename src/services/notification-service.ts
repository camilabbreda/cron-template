import ApiCogni from '../repositories/api-cogni';
import { validatePhone } from '../utils/phone-utils';
import { validateCompany, verifyNewClient } from '../utils/company-utils';
import { NotificationProcess } from '../types/notification-types';
import { blipNotificationData } from '../utils/notification-utils';
import ApiBlip from '../repositories/api-blip';
import { processInvoice } from './invoice-service';
import { extractInvoiceData } from '../utils/invoice-utils';
import { CampaignData, responseBlip } from '../types/blip-types';
import { handleServiceError } from '../utils/error-handler';
import { ServiceError } from '../types/error-types';



export async function processAllNotifications() {
  const errorList: ServiceError[] = []
  const successList: { campaignData: CampaignData, blipResponse: responseBlip, ucNumber: string }[] = []
  let notificationQuantity = 0
  try {
    console.log("[Cogni Notification] Starting cron job for active notification execution", new Date().toISOString());
    const apiCogni = new ApiCogni()
    const apiBlip = new ApiBlip()
    let pageNumber = 0
    const { totalPages } = await apiCogni.getTotalPages(pageNumber);
    for (pageNumber; pageNumber < totalPages; pageNumber++) {
      try {
        const { companies } = await apiCogni.getCompanies(pageNumber);
        for (const company of companies) {
          try {
            const notificationData: NotificationProcess[] = []
            if (!validateCompany(company)) continue;

            const validPhone = validatePhone(company.contact_phone);
            if (!validPhone) continue;
            company.contact_phone = validPhone as string

            const verifyFirstClientsNotifications = verifyNewClient(company)
            notificationData.push(verifyFirstClientsNotifications)
            const verifyInvoiceNotifications = await processInvoice(apiCogni, company.uc_number, errorList)
            notificationData.push(...verifyInvoiceNotifications)
            const notificationsList = notificationData.filter(not => not.action).filter(Boolean)
            if (notificationsList.length === 0) {
              continue;
            }

            for (const notification of notificationsList) {
              try {
                const invoiceData = extractInvoiceData(notification.doc)
                if (!(invoiceData && invoiceData?.dataVencimento && invoiceData?.valor) && !(notification.action === 'NA 100 Novos clientes' || notification.action === 'NA 200 Usina ativação')) continue

                const campaignData = blipNotificationData(notification, company, invoiceData)
                if (!campaignData) continue

                const blipResponse = await apiBlip.postWhatsappNotificationMessage(campaignData as CampaignData)
                if (blipResponse?.status !== "success") {
                  errorList.push({ context: "Cogni notification failure", message: 'Cogni notification failure', type: "GeneralError", data: blipResponse })
                }
                successList.push({ campaignData, blipResponse, ucNumber: company.uc_number })
                notificationQuantity += 1
              } catch (error) {
                const err = handleServiceError(error, "send notification", company.uc_number)
                errorList.push(err)
                console.error(err)
              }
            }
            
          } catch (error) {
            const err = handleServiceError(error, "process invoice notification", company.uc_number)
            errorList.push(err)
            console.error(err)
          }
        }
      } catch (error) {
        const err = handleServiceError(error, "load companies page")
        errorList.push(err)
        console.error(err)
      }
    }
    console.log("[Cogni Notification] Finished cron job for active notification execution", new Date().toISOString());
  } catch (error) {
    const err = handleServiceError(error, "load companies page")
    errorList.push(err)
    console.error(err);
  }
  return { errorList, successList, notificationQuantity }
}



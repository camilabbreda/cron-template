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
    console.log({
      message: "[Blip Notification] Starting cron job for active notification execution",
      timestamp: new Date().toISOString(),
    });
    const apiCogni = new ApiCogni()
    const apiBlip = new ApiBlip()
    let maxPages = 5
    for (let pageNumber = 0; pageNumber < maxPages; pageNumber++) {
      try {
        const { totalPages, companies } = await apiCogni.getCompanies(pageNumber);

        maxPages = totalPages

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
                  errorList.push({ context: "blip notification failure", message: 'blip notification failure', type: "GeneralError", data: blipResponse })
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
    console.log({
      message: "[Blip Notification] Finished cron job for active notification execution",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const err = handleServiceError(error, "load companies page")
    errorList.push(err)
    console.error(err);
  }
  return { errorList, successList, notificationQuantity }
}



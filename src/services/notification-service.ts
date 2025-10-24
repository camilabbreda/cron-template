import ApiCogni from '../repositories/api-cogni';
import { validatePhone } from '../utils/phone-utils';
import { validateCompany, verifyNewClient } from '../utils/company-utils';
import { NotificationProcess } from '../types/notification-types';
import { blipNotificationData } from '../utils/notification-utils';
import ApiBlip from '../repositories/api-blip';
import { processInvoice } from './invoice-service';
import { extractInvoiceData } from '../utils/invoice-utils';
import { CampaignData } from '../types/blip-types';



export async function processAllNotifications() {
  try {
    console.log({ message: "start  of cron blip active notification execution", date: new Date() })
    const apiCogni = new ApiCogni()
    const apiBlip = new ApiBlip()
    const errorList = []
    const successList: any = []
    let notificationQuantity = 0
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
            const verifyInvoiceNotifications = await processInvoice(apiCogni, company.uc_number)
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
                if(blipResponse?.status !== "success"){
                   errorList.push({ errorType: 'companies pages', data: blipResponse })
                }
                successList.push({ campaignData, blipResponse })
                notificationQuantity += 1
              } catch (error) {
                errorList.push({ errorType: 'send notification', data: notification, error })
                console.error("send notification:", notification);
              }
            }
          } catch (error) {
            errorList.push({ errorType: 'process invoice notification', data: company, error })
            console.error('company error', error)
          }
        }
      } catch (error) {
        errorList.push({ errorType: 'companies pages', data: pageNumber, error })
        console.error('page company', pageNumber)
      }
    }
    console.log({ message: "end of cron blip active notification execution", date: new Date() })
    return { errorList, successList, notificationQuantity }
  } catch (error) {
    console.error('Error processing notifications:', error);
  }
}



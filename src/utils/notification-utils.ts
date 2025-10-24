import { CampaignData } from "../types/blip-types"
import { Company, InvoiceData } from "../types/cogni-type"
import { NotificationProcess } from "../types/notification-types"

export function blipNotificationData(notification: NotificationProcess, company: Company, invoiceData?: InvoiceData | null): CampaignData | null {
  if (!notification || !notification.action || !company.contact_phone) return null

  switch (notification.action) {
    case 'NA 100 Novos clientes': {
      const campaignData: CampaignData = {
        phone: company.contact_phone,
        campaignName: `${process.env.TEMPLATE_NA100_NAME}`,
        stateId: `${process.env.TEMPLATE_NA100_STATEID}`,
        templateName: `${process.env.TEMPLATE_NA100_NAME}`,
        audience: { messageParams: null, },
        message: { messageParams: null },
      }
      return campaignData
    }
    case 'NA 200 Usina ativação': {
      const campaignData: CampaignData = {
        phone: company.contact_phone,
        campaignName: `${process.env.TEMPLATE_NA200_NAME}`,
        stateId: `${process.env.TEMPLATE_NA200_STATEID}`,
        templateName: `${process.env.TEMPLATE_NA200_NAME}`,
        audience: { messageParams: null, },
        message: { messageParams: null },
      }
      return campaignData
    }
    case 'NA 300 Primeiro boleto': {

      const campaignData: CampaignData = {
        phone: company.contact_phone,
        campaignName: `${process.env.TEMPLATE_NA300_NAME}`,
        stateId: `${process.env.TEMPLATE_NA300_STATEID}`,
        templateName: `${process.env.TEMPLATE_NA300_NAME}`,
        audience: { messageParams: { "1": notification.doc?.invoice_save_s3_html } },
        message: { messageParams: ["1"] },
      }
      return campaignData
    }
    case 'NA 400 Envio de boleto': {
      const campaignData: CampaignData = {
        phone: company.contact_phone,
        campaignName: `${process.env.TEMPLATE_NA400_NAME}`,
        stateId: `${process.env.TEMPLATE_NA400_STATEID}`,
        templateName: `${process.env.TEMPLATE_NA400_NAME}`,
        audience: {
          messageParams: {
            "1": notification.doc?.invoice_save_s3_html,
            "2": invoiceData?.dataVencimento,
          }
        },
        message: { messageParams: ["1", "2"] },
      }
      return campaignData
    }
    case 'NA 500 Envio de boleto': {
      const campaignData: CampaignData = {
        phone: company.contact_phone,
        campaignName: `${process.env.TEMPLATE_NA500_NAME}`,
        stateId: `${process.env.TEMPLATE_NA500_STATEID}`,
        templateName: `${process.env.TEMPLATE_NA500_NAME}`,
        audience: {
          messageParams: {
            "1": notification.doc?.invoice_save_s3_html,
            "2": invoiceData?.valor,
          }
        },
        message: { messageParams: ["1", "2"] },
      }
      return campaignData
    }
    case 'NA 600 Envio de boleto': {
      const campaignData: CampaignData = {
        phone: company.contact_phone,
        campaignName: `${process.env.TEMPLATE_NA600_NAME}`,
        stateId: `${process.env.TEMPLATE_NA600_STATEID}`,
        templateName: `${process.env.TEMPLATE_NA600_NAME}`,
        audience: {
          messageParams: {
            "1": invoiceData?.dataVencimento,
            idBoletoCampanha: notification.doc?.invoice_save_s3_html
          }
        },
        message: { messageParams: ["1"] },
      }
      return campaignData
    }
    case 'NA 700 Envio de boleto': {
      const campaignData: CampaignData = {
        phone: company.contact_phone,
        campaignName: `${process.env.TEMPLATE_NA700_NAME}`,
        stateId: `${process.env.TEMPLATE_NA700_STATEID}`,
        templateName: `${process.env.TEMPLATE_NA700_NAME}`,
        audience: {
          messageParams: {
            idBoletoCampanha: notification.doc?.invoice_save_s3_html
          }
        },
        message: { messageParams: null },
      }
      return campaignData
    }
    default:
      console.log("switch default")
      break;
  }
  return null
}

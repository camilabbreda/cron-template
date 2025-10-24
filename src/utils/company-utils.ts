import { Company } from "../types/cogni-type"
import { NotificationProcess } from "../types/notification-types"
import { expirationDatePlusDays, isTodayOrWeekendBefore } from "./date-utils"

export function validateCompany(company: Company) {
  if (!company || company.active !== "True" || !company.uc_number || !company.contact_phone || !company.created_at ) {
    return false
  }
  return true
}

export function verifyNewClient(company: Company): NotificationProcess {
  // VALIDA SE A EMPRESA É NOVA
  const newCompany = isTodayOrWeekendBefore(company.created_at)
  if (newCompany) {
    return { action: "NA 100 Novos clientes", doc: null }
  }

  //VALIDA ATIVAÇÃO USINA 60 DIAS APÓS CRIAÇÃO DA EMPRESA
  const isActivatedUsin = expirationDatePlusDays(company.created_at, 60)
  if (isActivatedUsin) {
    return { action: "NA 200 Usina ativação", doc: null }
  }
  return { action: null, doc: null }
}
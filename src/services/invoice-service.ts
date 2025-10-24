import ApiCogni from "../repositories/api-cogni"
import { NotificationProcess } from "../types/notification-types"
import { getYearMonth, isDueTodayOrNextWeekend, expirationDatePlusDays, actualAndPreviousMonth } from "../utils/date-utils"

export async function processInvoice(apiCogni: ApiCogni, uc_number: string): Promise<NotificationProcess[]> {
    const messagingProcess: NotificationProcess[] = []
    //VERIFICA PRIMEIRO BOLETO DO CLIENTE
    const firstInvoice = []
    const { invoices, totalPages } = await apiCogni.getInvoice(uc_number)
    const onlyOneBillIssued = invoices
    const existOpenInvoice = onlyOneBillIssued.filter(bill => bill.invoice_status === 3)
    if (existOpenInvoice.length >= 1 && totalPages === 1) {
        const referenceDate = getYearMonth(existOpenInvoice[0].invoice_emission_date)
        const areAllSameMonthYear = onlyOneBillIssued.every(doc => getYearMonth(doc.invoice_emission_date) === referenceDate)
        if (areAllSameMonthYear) {
            for (const invoice of existOpenInvoice) {
                try {
                    if (!invoice.invoice_emission_date || !invoice.invoice_due_date) continue
                    const validationDate = expirationDatePlusDays(invoice.invoice_due_date, -5, "SEXTA")
                    if (!validationDate) {
                        return [{ action: null, doc: null }]
                    }
                    firstInvoice.push({
                        action: 'NA 300 Primeiro boleto',
                        doc: existOpenInvoice[0]
                    })

                } catch (error) {
                    console.error('NA 300 Primeiro boleto', error)
                }
            }
        }
    }
    if (firstInvoice.length > 0) {
        return firstInvoice
    }

    //VERIFICA DEMAIS BOLETOS, CASO NÃO SEJA O PRIMEIRO BOLETO DO CLIENTE
    const actualAndPreviousMonths = actualAndPreviousMonth()
    //PROCESSA BOLETOS NOVO EMITIDOS E LEMBRETE DE VENCIMENTO
    if (actualAndPreviousMonths.length === 0) return [{ action: null, doc: null }]

    for (const monthYear of actualAndPreviousMonths) {
        const notification = await processNewIssuedInvoices(apiCogni, uc_number, monthYear)
        messagingProcess.push(...notification)
    }

    return messagingProcess
}

async function processNewIssuedInvoices(apiCogni: ApiCogni, uc_number: string, referenceDate: string): Promise<NotificationProcess[]> {
    const { invoices } = await apiCogni.getInvoice(uc_number, referenceDate)
    const notificatioList = []
    //VERIFICA SE TEM MAIS QUE UM BOLETO EM ABERTO EMITIDO NO MESMO MÊS
    const openInvoices = invoices.filter(doc => doc.invoice_status === 3)
    if (openInvoices.length === 0) {
        return [{ action: null, doc: null }]
    }

    //VERIFICA SE A DATA DE VENCIMENTO DO BOLETO REDUZIDA DE 5 DIAS É HOJE OU HOJE É SEXTA E A DATA CAI NO FINAL DE SEMANA
    const invoiceDueDate5DaysFront = openInvoices.filter(doc => expirationDatePlusDays(doc.invoice_due_date as string, -5, "SEXTA"))
    if (invoiceDueDate5DaysFront && invoiceDueDate5DaysFront.length === 1) {
        notificatioList.push({
            action: 'NA 400 Envio de boleto',
            doc: invoiceDueDate5DaysFront[0]
        })
    }

    //VERIFICA NOS BOLETOS DO MES PASSADO SE BOLETO VENCE HOJE OU HOJE É SEXTA E VENCE NO PRÓXIMO SÁBADO OU DOMINGO
    const invoiceDueDateToday = openInvoices.filter(doc => isDueTodayOrNextWeekend(doc.invoice_due_date as string))
    if (invoiceDueDateToday && invoiceDueDateToday.length === 1) {
        notificatioList.push({
            action: 'NA 500 Envio de boleto',
            doc: invoiceDueDateToday[0]
        })
    }

    //VERIFICA NOS BOLETOS DESSE MES E DO MES PASSADO SE ESTÁ VENCIDO HÁ 5 DIAS

    const invoiceExiperedFor5Days = openInvoices.filter(doc => expirationDatePlusDays(doc.invoice_due_date as string, 5))
    if (invoiceExiperedFor5Days && invoiceExiperedFor5Days.length === 1) {
        notificatioList.push({
            action: 'NA 600 Envio de boleto',
            doc: invoiceExiperedFor5Days[0]
        })
    }
    //VERIFICA NOS BOLETOS DESSE MES E DO MES PASSADO SE ESTÁ VENCIDO HÁ 15 DIAS
    const invoiceExiperedFor15Days = openInvoices.filter(doc => expirationDatePlusDays(doc.invoice_due_date as string, 15))
    if (invoiceExiperedFor15Days && invoiceExiperedFor15Days.length === 1) {
        notificatioList.push({
            action: 'NA 700 Envio de boleto',
            doc: invoiceExiperedFor15Days[0]
        })
    }

    return notificatioList
}
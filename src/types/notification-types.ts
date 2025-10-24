import { Invoice } from "./cogni-type"

export type NotificationProcess = {
    action: 
    'NA 100 Novos clientes' |
    'NA 200 Usina ativação' |
    'NA 300 Primeiro boleto' |
    'NA 400 Envio de boleto' |
    'NA 500 Envio de boleto' |
    'NA 600 Envio de boleto' |
    'NA 700 Envio de boleto' |
    string |
    null,
    doc: Invoice | null
}
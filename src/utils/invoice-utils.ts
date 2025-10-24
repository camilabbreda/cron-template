import { Invoice, InvoiceData } from "../types/cogni-type"
import { formatDateToDDMMYYYY } from "./date-utils";

export function extractInvoiceData(doc: Invoice | null): InvoiceData | null {
  const json = doc?.invoice_json_response;
  if (!json) return null;

  if ('payload' in json) {
    json.payload.resultado.valor = `${json.payload.resultado?.valor}`.replace(".",",")
    json.payload.resultado.dataVencimento = formatDateToDDMMYYYY(json.payload.resultado?.dataVencimento +" 00:00:000.00") as string
    return json.payload.resultado;
  }
  if ('boleto' in json) {
    json.boleto.valor = `${json.boleto.valor}`.replace(".",",")
    json.boleto.dataVencimento = formatDateToDDMMYYYY(json.boleto.dataVencimento +" 00:00:000.00") as string
    return json.boleto;
  }

  return null;
}



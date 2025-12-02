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


export function obtainSankhyaNotificatioLinkComplement(linkFatura: string): string | null {
  if (!linkFatura) return null;

  // Regex: capture everything after https://drive.google.com/
  const regex = /^https?:\/\/drive\.google\.com\/(.+)$/i;

  const match = linkFatura.match(regex);
  if (!match) return null;
  if (!match[1]) return null;
  return match[1]; // "file/d/xxxxx"
}

export function removeTextFromValue(value: string): string | null {
  if (!value) return null;
  if (typeof value !== 'string') return value;
  // remove "R$ " com ou sem espaços extras
  const cleanValue = value.replace(/\s*R\$\s*/g, '').trim()
  if(!cleanValue) return null;
  return cleanValue;
}

export type CogniResponse<T> = {
  asset_name: string,
  qtd_registers: number,
  total_pages: number,
  next_page: number,
  registers: T[],
}

export type Company = {
  uc_number: string
  contact_phone: string;
  active: string;
  created_at: string

}
export type Invoice = {
  invoice_status: number,
  invoice_due_date: string;
  invoice_json_response: InvoiceJsonResponse | InvoiceBoletoResponse | null;
  invoice_emission_date: string;
  value: number;
  invoice_save_s3_html: string;
}

export type InvoiceBoletoResponse = {
  boleto: InvoiceData

}

export type InvoiceJsonResponse = {
  payload: {
    resultado: InvoiceData
  }
}

export type InvoiceData = {
  dataEmissao: string,
  dataVencimento: string,
  valor: number | string
}

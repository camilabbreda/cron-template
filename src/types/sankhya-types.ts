export type tHeaders = {
    token: string
    appkey: string
    username: string
    password: string
    Authorization?: string
}
export type tAuthorization = {
    bearerToken: string,
    error: string | null
}

export interface tFieldMetadata {
    name: string;
    description: string;
    order: number;
    userType: "I" | "S";
}

export interface ResponseBody {
    fieldsMetadata: tFieldMetadata[];
    rows: unknown[][]; 
}

export type tRespondeSankhya = {
    serviceName: string,
    status: string,
    pendingPrinting: "false" | "true",
    transactionId: string,
    responseBody: ResponseBody
    burstLimit: boolean,
    timeQuery: string,
    timeResultSet: string
}


export interface tInvoice {
    ano: number;
    mes: number;
    nomeParceiro: string;
    historico: string;
    dtvenc: string;         // formatted date: "04/12/2024"
    valor: string;          // formatted: "R$ 37,56"
    whatsapp: string;
    email: string;
    linkFatura: string;
    situacao: string;       // "Pago", "Pendente", etc.
}

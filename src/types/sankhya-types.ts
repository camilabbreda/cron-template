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
    telefone: string;
    email: string;
    linkFatura: string;
    situacao: string;       // "Pago", "Pendente", etc.
}

// NA 100: Novos clientes - registrados hoje
export interface tNewClient {
    nomeParceiro: string;
    cgcCpf: string;
    dataAssinatura: string;    // formatted date: "dd/MM/yyyy"
    percentualDesconto: number; // decimal percentage
    telefone: string;
}

// NA 200: Primeira vinculação do cliente com Usina geradora
export interface tFirstGeneratorLink {
    mes: number;
    ano: number;
    nomeParceiro: string;
    cgcCpf: string;
    dataInclusao: string;      // timestamp
    telefone: string;
}

// NA 300: Primeiro boleto
export interface tFirstInvoice {
    mes: number;
    ano: number;
    nomeParceiro: string;
    cgcCpf: string;
    dataInclusao: string;      // timestamp
    telefone: string;
    linkFatura: string;
}

// NA 400: Quando boleto é emitido e registrado no banco
export interface tIssuedInvoice {
    mes: number;
    ano: number;
    nomeParceiro: string;
    cgcCpf: string;
    dataInclusao: string;      // timestamp
    telefone: string;
    linkFatura: string;
    dataVencimento: string;    // formatted date: "dd/MM/yyyy"
}

// NA 500: Quando boleto está vencendo (data de vencimento)
export interface tDueInvoice {
    mes: number;
    ano: number;
    nomeParceiro: string;
    cgcCpf: string;
    dataInclusao: string;      // timestamp
    telefone: string;
    linkFatura: string;
    valor: string;             // formatted: "R$ X,XX"
}

// NA 600: 5 dias após vencimento não pago
export interface tOverdueInvoice5Days {
    diasVencido: number;
    mes: number;
    ano: number;
    nomeParceiro: string;
    cgcCpf: string;
    dataInclusao: string;      // timestamp
    dataVencimento: string;    // formatted date: "dd/MM/yyyy"
    telefone: string;
    linkFatura: string;
}

// NA 700: 15 dias após vencimento não pago
export interface tOverdueInvoice15Days {
    diasVencido: number;
    mes: number;
    ano: number;
    nomeParceiro: string;
    cgcCpf: string;
    dataInclusao: string;      // timestamp
    dataVencimento: string;    // formatted date: "dd/MM/yyyy"
    telefone: string;
    linkFatura: string;
}

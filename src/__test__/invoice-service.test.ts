import { processInvoice } from "../services/invoice-service";
import ApiCogni from "../repositories/api-cogni";
import { Invoice, InvoiceJsonResponse } from "../types/cogni-type";
import * as dateUtils from "../utils/date-utils";

jest.mock("../repositories/api-cogni");

describe("processInvoice", () => {
  let mockApi: jest.Mocked<ApiCogni>;

  beforeEach(() => {
    mockApi = new ApiCogni() as jest.Mocked<ApiCogni>;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("returns notification for first open invoice", async () => {
    const invoice: Invoice = {
      invoice_status: 3,
      invoice_due_date: "2025-10-25  00:00:000.00",
      invoice_emission_date: "2025-10-19  00:00:000.00",
      invoice_json_response: {} as InvoiceJsonResponse,
      value: 100,
      invoice_save_s3_html: "",
    };

    mockApi.getInvoice.mockResolvedValue({
      invoices: [invoice],
      totalPages: 1,
    });

    jest.useFakeTimers({ now: new Date("2025-10-20 00:00:000.00") });
    jest.spyOn(dateUtils, "getYearMonth").mockReturnValue("2025-10");
    const result = await processInvoice(mockApi, "UC123");
    expect(result).toEqual([
      {
        action: "NA 300 Primeiro boleto",
        doc: invoice,
      },
    ]);
  });

  it("returns notification equals null if more than one page for request invoice", async () => {
    const invoice: Invoice = {
      invoice_status: 3,
      invoice_due_date: "2025-10-26 00:00:000.00",
      invoice_emission_date: "2025-10-19 00:00:000.00",
      invoice_json_response: {} as InvoiceJsonResponse,
      value: 100,
      invoice_save_s3_html: "",
    };

    mockApi.getInvoice.mockResolvedValue({
      invoices: [invoice],
      totalPages: 8,
    });

    jest.useFakeTimers({ now: new Date("2025-10-20 00:00:000.00") });
    jest.spyOn(dateUtils, "getYearMonth").mockReturnValue("2025-10");
    const result = await processInvoice(mockApi, "UC123");
    expect(result).not.toEqual([
      {
        action: "NA 300 Primeiro boleto",
        doc: invoice,
      },
    ]);
  });

  it("returns notifications for new issued invoices and due today invoices", async () => {
    const invoice1: Invoice = {
      invoice_status: 3,
      invoice_due_date: "2025-10-25 00:00:00",
      invoice_emission_date: "2025-10-18  00:00:00",
      invoice_json_response: {} as InvoiceJsonResponse,
      value: 200,
      invoice_save_s3_html: "",
    };

    const invoice2: Invoice = {
      invoice_status: 2,
      invoice_due_date: "2025-11-17  00:00:00",
      invoice_emission_date: "2025-08-15  00:00:00",
      invoice_json_response: {} as InvoiceJsonResponse,
      value: 300,
      invoice_save_s3_html: "",
    };


    const invoice3: Invoice = {
      invoice_status: 3,
      invoice_due_date: "2025-10-20  00:00:00",
      invoice_emission_date: "2025-09-18  00:00:00",
      invoice_json_response: {}as InvoiceJsonResponse,
      value: 200,
      invoice_save_s3_html: "",
    };
    jest.useFakeTimers({ now: new Date("2025-10-20 00:00:000.00") });

    // Mock first getInvoice call (current month)
    mockApi.getInvoice.mockResolvedValueOnce({
      invoices: [invoice1, invoice2, invoice3],
      totalPages: 1,
    });

    // Mock second getInvoice call (previous month)
    mockApi.getInvoice.mockResolvedValueOnce({
      invoices: [invoice2],
      totalPages: 1,
    });
    mockApi.getInvoice.mockResolvedValueOnce({
      invoices: [invoice3],
      totalPages: 1,
    });
    mockApi.getInvoice.mockResolvedValueOnce({
      invoices: [invoice1],
      totalPages: 1,
    });

    const result = await processInvoice(mockApi, "UC123");
    expect(result).toEqual([
      {
        action: null,
        doc: null,
      },
      {
        action: 'NA 500 Envio de boleto',
        doc: invoice3,
      },
      {
        action: "NA 400 Envio de boleto",
        doc: invoice1,
      },
    ]);
  });

  it("returns notifications for invoices due date on weekend", async () => {
    const invoice1: Invoice = {
      invoice_status: 3,
      invoice_due_date: "2025-10-25 00:00:00",
      invoice_emission_date: "2025-09-18  00:00:00",
      invoice_json_response: {} as InvoiceJsonResponse,
      value: 200,
      invoice_save_s3_html: "",
    };

    const invoice2: Invoice = {
      invoice_status: 2,
      invoice_due_date: "2025-10-24 00:00:00",
      invoice_emission_date: "2025-08-01 00:00:00",
      invoice_json_response: {} as InvoiceJsonResponse,
      value: 300,
      invoice_save_s3_html: "",
    };


    const invoice3: Invoice = {
      invoice_status: 3,
      invoice_due_date: "2025-11-15 00:00:00",
      invoice_emission_date: "2025-10-24 00:00:00",
      invoice_json_response: {} as InvoiceJsonResponse,
      value: 200,
      invoice_save_s3_html: "",
    };

    jest.useFakeTimers({ now: new Date("2025-10-24 00:00:000.00") });

    // Mock first getInvoice call (current month)
    mockApi.getInvoice.mockResolvedValueOnce({
      invoices: [invoice1, invoice2, invoice3],
      totalPages: 1,
    });

    // Mock second getInvoice call (previous month)
    mockApi.getInvoice.mockResolvedValueOnce({
      invoices: [invoice2],
      totalPages: 1,
    });
    mockApi.getInvoice.mockResolvedValueOnce({
      invoices: [invoice3],
      totalPages: 1,
    });
    mockApi.getInvoice.mockResolvedValueOnce({
      invoices: [invoice1],
      totalPages: 1,
    });

    const result = await processInvoice(mockApi, "UC123");
    expect(result).toEqual([
      {
        action: null,
        doc: null,
      },
      {
        action: 'NA 500 Envio de boleto',
        doc: invoice1,
      },
    ]);
  });

  it("returns notifications for invoices due expired 5 day ago and on the weekend before", async () => {
    const invoice1: Invoice = {
      invoice_status: 3,
      invoice_due_date: "2025-09-30 00:00:00",
      invoice_emission_date: "2025-08-25 00:00:00",
      invoice_json_response: {} as InvoiceJsonResponse,
      value: 200,
      invoice_save_s3_html: "",
    };

    const invoice2: Invoice = {
      invoice_status: 3,
      invoice_due_date: "2025-10-01 00:00:00",
      invoice_emission_date: "2025-09-18  00:00:00",
      invoice_json_response: {} as InvoiceJsonResponse,
      value: 200,
      invoice_save_s3_html: "",
    };

    const invoice3: Invoice = {
      invoice_status: 3,
      invoice_due_date: "2025-10-07 00:00:00",
      invoice_emission_date: "2025-10-01 00:00:00",
      invoice_json_response: {} as InvoiceJsonResponse,
      value: 300,
      invoice_save_s3_html: "",
    };

    jest.useFakeTimers({ now: new Date("2025-10-06 00:00:000.00") });

    // Mock first getInvoice call (current month)
    mockApi.getInvoice.mockResolvedValueOnce({
      invoices: [invoice1, invoice2, invoice3],
      totalPages: 1,
    });

    // Mock second getInvoice call (previous month)
    mockApi.getInvoice.mockResolvedValueOnce({
      invoices: [invoice1],
      totalPages: 1,
    });
    mockApi.getInvoice.mockResolvedValueOnce({
      invoices: [invoice2],
      totalPages: 1,
    });
    mockApi.getInvoice.mockResolvedValueOnce({
      invoices: [invoice3],
      totalPages: 1,
    });

    const result = await processInvoice(mockApi, "UC123");
    expect(result).toEqual([
      {
        action: "NA 600 Envio de boleto",
        doc: invoice1,
      },
      {
        action: "NA 600 Envio de boleto",
        doc: invoice2,
      }
    ]);
  });

  it("returns notifications for invoices due expired 15 day ago and on the weekend before", async () => {
    const invoice1: Invoice = {
      invoice_status: 3,
      invoice_due_date: "2025-09-28 00:00:00",
      invoice_emission_date: "2025-08-17 00:00:00",
      invoice_json_response: {} as InvoiceJsonResponse,
      value: 200,
      invoice_save_s3_html: "",
    };

    const invoice2: Invoice = {
      invoice_status: 3,
      invoice_due_date: "2025-09-27 00:00:00",
      invoice_emission_date: "2025-09-18  00:00:00",
      invoice_json_response: {} as InvoiceJsonResponse,
      value: 200,
      invoice_save_s3_html: "",
    };

    const invoice3: Invoice = {
      invoice_status: 3,
      invoice_due_date: "2025-10-07 00:00:00",
      invoice_emission_date: "2025-10-01 00:00:00",
      invoice_json_response: {} as InvoiceJsonResponse,
      value: 300,
      invoice_save_s3_html: "",
    };

    jest.useFakeTimers({ now: new Date("2025-10-13 00:00:000.00") });

    // Mock first getInvoice call (current month)
    mockApi.getInvoice.mockResolvedValueOnce({
      invoices: [invoice1, invoice2, invoice3],
      totalPages: 1,
    });

    // Mock second getInvoice call (previous month)
    mockApi.getInvoice.mockResolvedValueOnce({
      invoices: [invoice1],
      totalPages: 1,
    });
    mockApi.getInvoice.mockResolvedValueOnce({
      invoices: [invoice2],
      totalPages: 1,
    });
    mockApi.getInvoice.mockResolvedValueOnce({
      invoices: [invoice3],
      totalPages: 1,
    });

    const result = await processInvoice(mockApi, "UC123");
    expect(result).toEqual([
      {
        action: "NA 700 Envio de boleto",
        doc: invoice1,
      },
      {
        action: "NA 700 Envio de boleto",
        doc: invoice2,
      },
      {
        action: "NA 600 Envio de boleto",
        doc: invoice3,
      }
    ]);
  });

  it("returns empty notifications if no open invoices", async () => {
    mockApi.getInvoice.mockResolvedValue({
      invoices: [],
      totalPages: 1,
    });

    const result = await processInvoice(mockApi, "UC123");
    expect(result).toEqual([{ action: null, doc: null }, { action: null, doc: null }, { action: null, doc: null }]);
  });

  it("handles multiple invoices in same month but skips notifications if weekend check fails", async () => {
    const invoice: Invoice = {
      invoice_status: 3,
      invoice_due_date: "2025-11-16",
      invoice_emission_date: "2025-10-16",
      invoice_json_response: {} as InvoiceJsonResponse,
      value: 500,
      invoice_save_s3_html: "",
    };

    jest.spyOn(dateUtils, "isTodayOrWeekendBefore").mockReturnValue(false);
    jest.useFakeTimers({ now: new Date("2025-10-20 00:00:000.00") });
    jest.spyOn(dateUtils, "getYearMonth").mockReturnValue("2025-10");

    mockApi.getInvoice.mockResolvedValue({
      invoices: [invoice],
      totalPages: 1,
    });

    const result = await processInvoice(mockApi, "UC123");
    expect(result).toEqual([{ action: null, doc: null }]);
  });
});

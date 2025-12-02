import { processAllSankhyaNotifications } from '../../services/notification-sankhya-service';
import ApiSankhya from '../../repositories/api-sankhya';
import ApiBlip from '../../repositories/api-blip';
// import * as phoneUtils from '../utils/phone-utils';
import { responseBlip } from '../../types/blip-types';

jest.mock('../../repositories/api-sankhya');
jest.mock('../../repositories/api-blip');
// jest.mock('../utils/phone-utils');


// Helper to create a valid mock response
const createMockBlipResponse = (): responseBlip => ({
  type: 'notification',
  resource: {
    id: 'test-id',
    name: 'test-campaign',
    campaignType: 'INDIVIDUAL',
    masterState: 'test-master',
    flowId: 'test-flow',
    stateId: 'test-state',
    status: 'processing',
    created: '2025-11-27',
    tags: [],
    isToUseLiteApi: false,
    channelType: 'WHATSAPP',
    canSendWithOpenTicket: false,
  },
  method: 'set',
  status: 'success',
  id: 'test-id-123',
  from: 'test@bot',
  to: 'test@recipient',
  metadata: {
    traceparent: 'test-trace',
    '#command.uri': '/test',
    '#metrics.custom.label': 'test',
  },
});
const mockApiBlip = {
  postWhatsappNotificationMessage: jest.fn(),
} as unknown as jest.Mocked<ApiBlip>;
const mockApiSankhya = {
  getNewClientsToday: jest.fn(),
  getFirstGeneratorLinks: jest.fn(),
  getFirstInvoices: jest.fn(),
  getIssuedInvoices: jest.fn(),
  getDueInvoices: jest.fn(),
  getOverdueInvoices5Days: jest.fn(),
  getOverdueInvoices15Days: jest.fn(),
} as unknown as jest.Mocked<ApiSankhya>;

describe('Sankhya Notification Service', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    (ApiSankhya as jest.Mock).mockImplementation(() => mockApiSankhya);
    (ApiBlip as jest.Mock).mockImplementation(() => mockApiBlip);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('processAllSankhyaNotifications - Orchestrator', () => {
    it('should process all notification types sequentially', async () => {
      // Mock all API methods to return empty arrays
      mockApiSankhya.getNewClientsToday.mockResolvedValue([]);
      mockApiSankhya.getFirstGeneratorLinks.mockResolvedValue([]);
      mockApiSankhya.getFirstInvoices.mockResolvedValue([]);
      mockApiSankhya.getIssuedInvoices.mockResolvedValue([]);
      mockApiSankhya.getDueInvoices.mockResolvedValue([]);
      mockApiSankhya.getOverdueInvoices5Days.mockResolvedValue([]);
      mockApiSankhya.getOverdueInvoices15Days.mockResolvedValue([]);

      await processAllSankhyaNotifications();

      // Verify all methods were called
      expect(mockApiSankhya.getNewClientsToday).toHaveBeenCalled();
      expect(mockApiSankhya.getFirstGeneratorLinks).toHaveBeenCalled();
      expect(mockApiSankhya.getFirstInvoices).toHaveBeenCalled();
      expect(mockApiSankhya.getIssuedInvoices).toHaveBeenCalled();
      expect(mockApiSankhya.getDueInvoices).toHaveBeenCalled();
      expect(mockApiSankhya.getOverdueInvoices5Days).toHaveBeenCalled();
      expect(mockApiSankhya.getOverdueInvoices15Days).toHaveBeenCalled();
    });

    it('should handle errors gracefully and continue processing', async () => {
      // Mock one method to throw an error, others to return empty arrays
      mockApiSankhya.getNewClientsToday.mockRejectedValue(new Error('API Error'));
      mockApiSankhya.getFirstGeneratorLinks.mockResolvedValue([]);
      mockApiSankhya.getFirstInvoices.mockResolvedValue([]);
      mockApiSankhya.getIssuedInvoices.mockResolvedValue([]);
      mockApiSankhya.getDueInvoices.mockResolvedValue([]);
      mockApiSankhya.getOverdueInvoices5Days.mockResolvedValue([]);
      mockApiSankhya.getOverdueInvoices15Days.mockResolvedValue([]);

      // Should not throw
      await expect(processAllSankhyaNotifications()).resolves.not.toThrow();

      // Verify other methods were still called
      expect(mockApiSankhya.getFirstGeneratorLinks).toHaveBeenCalled();
    });

    it('should skip items with invalid phone numbers', async () => {
      const newClient = {
        nomeParceiro: 'Test Client',
        cgcCpf: '12345678000190',
        dataAssinatura: '27/11/2025',
        percentualDesconto: 0.1,
        telefone: 'invalid-phone',
      };

      mockApiSankhya.getNewClientsToday.mockResolvedValue([newClient] as never);
      mockApiSankhya.getFirstGeneratorLinks.mockResolvedValue([]);
      mockApiSankhya.getFirstInvoices.mockResolvedValue([]);
      mockApiSankhya.getIssuedInvoices.mockResolvedValue([]);
      mockApiSankhya.getDueInvoices.mockResolvedValue([]);
      mockApiSankhya.getOverdueInvoices5Days.mockResolvedValue([]);
      mockApiSankhya.getOverdueInvoices15Days.mockResolvedValue([]);

      await processAllSankhyaNotifications();

      // Should not call Blip for invalid phone
      expect(mockApiBlip.postWhatsappNotificationMessage).not.toHaveBeenCalled();
    });

    it('should process valid items and call Blip API', async () => {
      const newClient = {
        nomeParceiro: 'Test Client',
        cgcCpf: '12345678000190',
        dataAssinatura: '27/11/2025',
        percentualDesconto: 0.1,
        telefone: '85999999999',
      };

      mockApiSankhya.getNewClientsToday.mockResolvedValue([newClient] as never);
      mockApiSankhya.getFirstGeneratorLinks.mockResolvedValue([]);
      mockApiSankhya.getFirstInvoices.mockResolvedValue([]);
      mockApiSankhya.getIssuedInvoices.mockResolvedValue([]);
      mockApiSankhya.getDueInvoices.mockResolvedValue([]);
      mockApiSankhya.getOverdueInvoices5Days.mockResolvedValue([]);
      mockApiSankhya.getOverdueInvoices15Days.mockResolvedValue([]);

      mockApiBlip.postWhatsappNotificationMessage.mockResolvedValue(
        createMockBlipResponse()
      );

      await processAllSankhyaNotifications();

      // Verify Blip was called for valid item
      expect(mockApiBlip.postWhatsappNotificationMessage).toHaveBeenCalled();
    });
  });

  describe('NA 100 - New Clients', () => {
    it('should send NA 100 notification for new clients today', async () => {
      const newClient = {
        nomeParceiro: 'New Client',
        cgcCpf: '12345678000190',
        dataAssinatura: '27/11/2025',
        percentualDesconto: 0.15,
        telefone: '85999999999',
      };

      mockApiSankhya.getNewClientsToday.mockResolvedValue([newClient] as never);
      mockApiSankhya.getFirstGeneratorLinks.mockResolvedValue([]);
      mockApiSankhya.getFirstInvoices.mockResolvedValue([]);
      mockApiSankhya.getIssuedInvoices.mockResolvedValue([]);
      mockApiSankhya.getDueInvoices.mockResolvedValue([]);
      mockApiSankhya.getOverdueInvoices5Days.mockResolvedValue([]);
      mockApiSankhya.getOverdueInvoices15Days.mockResolvedValue([]);
      mockApiBlip.postWhatsappNotificationMessage.mockResolvedValue(
        createMockBlipResponse()
      );

      await processAllSankhyaNotifications();

      expect(mockApiBlip.postWhatsappNotificationMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          phone: '+5585999999999',
        })
      );
    });
  });

  describe('NA 200 - First Generator Links', () => {
    it('should send NA 200 notification for first generator links', async () => {
      const firstLink = {
        mes: 11,
        ano: 2025,
        nomeParceiro: 'Client With Link',
        cgcCpf: '87654321000199',
        dataInclusao: '2025-11-27T10:00:00',
        telefone: '85988888888',
      };

      mockApiSankhya.getNewClientsToday.mockResolvedValue([]);
      mockApiSankhya.getFirstGeneratorLinks.mockResolvedValue([firstLink] as never);
      mockApiSankhya.getFirstInvoices.mockResolvedValue([]);
      mockApiSankhya.getIssuedInvoices.mockResolvedValue([]);
      mockApiSankhya.getDueInvoices.mockResolvedValue([]);
      mockApiSankhya.getOverdueInvoices5Days.mockResolvedValue([]);
      mockApiSankhya.getOverdueInvoices15Days.mockResolvedValue([]);


      mockApiBlip.postWhatsappNotificationMessage.mockResolvedValue(
        createMockBlipResponse()
      );

      await processAllSankhyaNotifications();

      expect(mockApiBlip.postWhatsappNotificationMessage).toHaveBeenCalled();
    });
  });

  describe('NA 300 - First Invoices', () => {
    it('should send NA 300 notification for first invoices', async () => {
      const firstInvoice = {
        mes: 11,
        ano: 2025,
        nomeParceiro: 'Client With Invoice',
        cgcCpf: '11111111000111',
        dataInclusao: '2025-11-27T10:00:00',
        telefone: '85987654321',
        linkFatura: 'https://example.com/invoice1.pdf',
      };

      mockApiSankhya.getNewClientsToday.mockResolvedValue([]);
      mockApiSankhya.getFirstGeneratorLinks.mockResolvedValue([]);
      mockApiSankhya.getFirstInvoices.mockResolvedValue([firstInvoice] as never);
      mockApiSankhya.getIssuedInvoices.mockResolvedValue([]);
      mockApiSankhya.getDueInvoices.mockResolvedValue([]);
      mockApiSankhya.getOverdueInvoices5Days.mockResolvedValue([]);
      mockApiSankhya.getOverdueInvoices15Days.mockResolvedValue([]);



      mockApiBlip.postWhatsappNotificationMessage.mockResolvedValue(
        createMockBlipResponse()
      );

      await processAllSankhyaNotifications();

      expect(mockApiBlip.postWhatsappNotificationMessage).toHaveBeenCalled();
    });
  });

  describe('NA 400 - Issued Invoices (5 days before due)', () => {
    it('should send NA 400 notification for issued invoices', async () => {
      const issuedInvoice = {
        mes: 11,
        ano: 2025,
        nomeParceiro: 'Client With Due',
        cgcCpf: '22222222000222',
        dataInclusao: '2025-11-27T10:00:00',
        telefone: '85986543210',
        linkFatura: 'https://example.com/invoice2.pdf',
        dataVencimento: '30/11/2025',
      };

      mockApiSankhya.getNewClientsToday.mockResolvedValue([]);
      mockApiSankhya.getFirstGeneratorLinks.mockResolvedValue([]);
      mockApiSankhya.getFirstInvoices.mockResolvedValue([]);
      mockApiSankhya.getIssuedInvoices.mockResolvedValue([issuedInvoice] as never);
      mockApiSankhya.getDueInvoices.mockResolvedValue([]);
      mockApiSankhya.getOverdueInvoices5Days.mockResolvedValue([]);
      mockApiSankhya.getOverdueInvoices15Days.mockResolvedValue([]);


      mockApiBlip.postWhatsappNotificationMessage.mockResolvedValue(
        createMockBlipResponse()
      );

      await processAllSankhyaNotifications();

      expect(mockApiBlip.postWhatsappNotificationMessage).toHaveBeenCalled();
    });
  });

  describe('NA 500 - Due Today', () => {
    it('should send NA 500 notification for invoices due today', async () => {
      const dueInvoice = {
        mes: 11,
        ano: 2025,
        nomeParceiro: 'Client Due Today',
        cgcCpf: '33333333000333',
        dataInclusao: '2025-11-27T10:00:00',
        telefone: '85985432109',
        linkFatura: 'https://example.com/invoice3.pdf',
        valor: 'R$ 1.500,00',
      };

      mockApiSankhya.getNewClientsToday.mockResolvedValue([]);
      mockApiSankhya.getFirstGeneratorLinks.mockResolvedValue([]);
      mockApiSankhya.getFirstInvoices.mockResolvedValue([]);
      mockApiSankhya.getIssuedInvoices.mockResolvedValue([]);
      mockApiSankhya.getDueInvoices.mockResolvedValue([dueInvoice] as never);
      mockApiSankhya.getOverdueInvoices5Days.mockResolvedValue([]);
      mockApiSankhya.getOverdueInvoices15Days.mockResolvedValue([]);

      mockApiBlip.postWhatsappNotificationMessage.mockResolvedValue(
        createMockBlipResponse()
      );

      await processAllSankhyaNotifications();

      expect(mockApiBlip.postWhatsappNotificationMessage).toHaveBeenCalled();
    });
  });

  describe('NA 600 - Overdue 5 Days', () => {
    it('should send NA 600 notification for invoices overdue 5 days', async () => {
      const overdueInvoice5d = {
        diasVencido: 5,
        mes: 11,
        ano: 2025,
        nomeParceiro: 'Client Overdue 5d',
        cgcCpf: '44444444000444',
        dataInclusao: '2025-11-27T10:00:00',
        dataVencimento: '22/11/2025',
        telefone: '85984321098',
        linkFatura: 'https://example.com/invoice4.pdf',
      };

      mockApiSankhya.getNewClientsToday.mockResolvedValue([]);
      mockApiSankhya.getFirstGeneratorLinks.mockResolvedValue([]);
      mockApiSankhya.getFirstInvoices.mockResolvedValue([]);
      mockApiSankhya.getIssuedInvoices.mockResolvedValue([]);
      mockApiSankhya.getDueInvoices.mockResolvedValue([]);
      mockApiSankhya.getOverdueInvoices5Days.mockResolvedValue([overdueInvoice5d] as never);
      mockApiSankhya.getOverdueInvoices15Days.mockResolvedValue([]);



      mockApiBlip.postWhatsappNotificationMessage.mockResolvedValue(
        createMockBlipResponse()
      );

      await processAllSankhyaNotifications();

      expect(mockApiBlip.postWhatsappNotificationMessage).toHaveBeenCalled();
    });
  });

  describe('NA 700 - Overdue 15 Days', () => {
    it('should send NA 700 notification for invoices overdue 15 days', async () => {
      const overdueInvoice15d = {
        diasVencido: 15,
        mes: 11,
        ano: 2025,
        nomeParceiro: 'Client Overdue 15d',
        cgcCpf: '55555555000555',
        dataInclusao: '2025-11-27T10:00:00',
        dataVencimento: '12/11/2025',
        telefone: '85983210987',
        linkFatura: 'https://example.com/invoice5.pdf',
      };

      mockApiSankhya.getNewClientsToday.mockResolvedValue([]);
      mockApiSankhya.getFirstGeneratorLinks.mockResolvedValue([]);
      mockApiSankhya.getFirstInvoices.mockResolvedValue([]);
      mockApiSankhya.getIssuedInvoices.mockResolvedValue([]);
      mockApiSankhya.getDueInvoices.mockResolvedValue([]);
      mockApiSankhya.getOverdueInvoices5Days.mockResolvedValue([]);
      mockApiSankhya.getOverdueInvoices15Days.mockResolvedValue([overdueInvoice15d] as never);

      mockApiBlip.postWhatsappNotificationMessage.mockResolvedValue(
        createMockBlipResponse()
      );

      await processAllSankhyaNotifications();

      expect(mockApiBlip.postWhatsappNotificationMessage).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle Blip API failures gracefully', async () => {
      const newClient = {
        nomeParceiro: 'New Client',
        cgcCpf: '12345678000190',
        dataAssinatura: '27/11/2025',
        percentualDesconto: 0.1,
        telefone: '85999999999',
      };

      mockApiSankhya.getNewClientsToday.mockResolvedValue([newClient] as never);
      mockApiSankhya.getFirstGeneratorLinks.mockResolvedValue([]);
      mockApiSankhya.getFirstInvoices.mockResolvedValue([]);
      mockApiSankhya.getIssuedInvoices.mockResolvedValue([]);
      mockApiSankhya.getDueInvoices.mockResolvedValue([]);
      mockApiSankhya.getOverdueInvoices5Days.mockResolvedValue([]);
      mockApiSankhya.getOverdueInvoices15Days.mockResolvedValue([]);

      mockApiBlip.postWhatsappNotificationMessage.mockRejectedValue(
        new Error('Blip API Error')
      );

      // Should not throw
      await expect(processAllSankhyaNotifications()).resolves.not.toThrow();
    });

    it('should continue processing after Sankhya API error', async () => {
      mockApiSankhya.getNewClientsToday.mockRejectedValue(new Error('Sankhya Error'));
      mockApiSankhya.getFirstGeneratorLinks.mockResolvedValue([]);
      mockApiSankhya.getFirstInvoices.mockResolvedValue([]);
      mockApiSankhya.getIssuedInvoices.mockResolvedValue([]);
      mockApiSankhya.getDueInvoices.mockResolvedValue([]);
      mockApiSankhya.getOverdueInvoices5Days.mockResolvedValue([]);
      mockApiSankhya.getOverdueInvoices15Days.mockResolvedValue([]);

      // Should not throw
      await expect(processAllSankhyaNotifications()).resolves.not.toThrow();

      // Verify next processor was called despite error
      expect(mockApiSankhya.getFirstGeneratorLinks).toHaveBeenCalled();
    });
  });
});

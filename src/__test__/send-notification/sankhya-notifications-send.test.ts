import ApiSankhya from '../../repositories/api-sankhya';
import { processAllSankhyaNotifications } from '../../services/notification-sankhya-service';

/**
 * Integration tests for Sankhya notifications
 * These tests mock Sankhya API responses and allow real Blip API calls
 * Target phone: 5548991516758
 */

jest.mock('../../repositories/api-sankhya');
const MockApiSankhya = ApiSankhya as jest.MockedClass<typeof ApiSankhya>;

describe('Sankhya Notification Integration - Real Blip API Send', () => {
  const TARGET_PHONE = '5548991516768';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe.skip('NA 100 - New Client Notification', () => {
    it('should send NA 100 notification via Blip API with mocked Sankhya response', async () => {
      const mockNewClient = {
        nomeParceiro: 'Test Client NA100',
        cgcCpf: '12345678000190',
        dataAssinatura: '28/11/2025',
        percentualDesconto: 0.1,
        telefone: TARGET_PHONE,
      };

      MockApiSankhya.prototype.getNewClientsToday.mockResolvedValue([mockNewClient] as never);
      MockApiSankhya.prototype.getFirstGeneratorLinks.mockResolvedValue([]);
      MockApiSankhya.prototype.getFirstInvoices.mockResolvedValue([]);
      MockApiSankhya.prototype.getIssuedInvoices.mockResolvedValue([]);
      MockApiSankhya.prototype.getDueInvoices.mockResolvedValue([]);
      MockApiSankhya.prototype.getOverdueInvoices5Days.mockResolvedValue([]);
      MockApiSankhya.prototype.getOverdueInvoices15Days.mockResolvedValue([]);

      const result = await processAllSankhyaNotifications();

      expect(MockApiSankhya.prototype.getNewClientsToday).toHaveBeenCalled();
      expect(result.notificationQuantity).toBeGreaterThan(0);
      console.log(`✓ NA 100: ${result.notificationQuantity} notification(s) sent to ${TARGET_PHONE}`);
    });
  });

  describe.skip('NA 200 - First Generator Link Notification', () => {
    it('should send NA 200 notification via Blip API with mocked Sankhya response', async () => {
      const mockGeneratorLink = {
        mes: 11,
        ano: 2025,
        nomeParceiro: 'Test Client NA200',
        cgcCpf: '87654321000199',
        dataInclusao: '2025-11-28T10:00:00',
        telefone: TARGET_PHONE,
      };

      MockApiSankhya.prototype.getNewClientsToday.mockResolvedValue([]);
      MockApiSankhya.prototype.getFirstGeneratorLinks.mockResolvedValue([mockGeneratorLink] as never);
      MockApiSankhya.prototype.getFirstInvoices.mockResolvedValue([]);
      MockApiSankhya.prototype.getIssuedInvoices.mockResolvedValue([]);
      MockApiSankhya.prototype.getDueInvoices.mockResolvedValue([]);
      MockApiSankhya.prototype.getOverdueInvoices5Days.mockResolvedValue([]);
      MockApiSankhya.prototype.getOverdueInvoices15Days.mockResolvedValue([]);

      const result = await processAllSankhyaNotifications();

      expect(MockApiSankhya.prototype.getFirstGeneratorLinks).toHaveBeenCalled();
      expect(result.notificationQuantity).toBeGreaterThan(0);
      console.log(`✓ NA 200: ${result.notificationQuantity} notification(s) sent to ${TARGET_PHONE}`);
    });
  });

  describe.skip('NA 300 - First Invoice Notification', () => {
    it('should send NA 300 notification via Blip API with mocked Sankhya response', async () => {
      const mockFirstInvoice = {
        mes: 11,
        ano: 2025,
        nomeParceiro: 'Test Client NA300',
        cgcCpf: '11111111000111',
        dataInclusao: '2025-11-28T10:00:00',
        telefone: TARGET_PHONE,
        linkFatura: 'https://drive.google.com/file/d/1yrA6LK4AAns4c_ulDYMh6kuh-RBLuPEg',
      };

      MockApiSankhya.prototype.getNewClientsToday.mockResolvedValue([]);
      MockApiSankhya.prototype.getFirstGeneratorLinks.mockResolvedValue([]);
      MockApiSankhya.prototype.getFirstInvoices.mockResolvedValue([mockFirstInvoice] as never);
      MockApiSankhya.prototype.getIssuedInvoices.mockResolvedValue([]);
      MockApiSankhya.prototype.getDueInvoices.mockResolvedValue([]);
      MockApiSankhya.prototype.getOverdueInvoices5Days.mockResolvedValue([]);
      MockApiSankhya.prototype.getOverdueInvoices15Days.mockResolvedValue([]);

      const result = await processAllSankhyaNotifications();

      expect(MockApiSankhya.prototype.getFirstInvoices).toHaveBeenCalled();
      expect(result.notificationQuantity).toBeGreaterThan(0);
      console.log(`✓ NA 300: ${result.notificationQuantity} notification(s) sent to ${TARGET_PHONE}`);
    });
  });

  describe.skip('NA 400 - Issued Invoice (5 days before due) Notification', () => {
    it('should send NA 400 notification via Blip API with mocked Sankhya response', async () => {
      const mockIssuedInvoice = {
        mes: 11,
        ano: 2025,
        nomeParceiro: 'Test Client NA400',
        cgcCpf: '22222222000222',
        dataInclusao: '2025-11-28T10:00:00',
        telefone: TARGET_PHONE,
        linkFatura: 'https://drive.google.com/file/d/1yrA6LK4AAns4c_ulDYMh6kuh-RBLuPEg',
        dataVencimento: '03/12/2025',
      };

      MockApiSankhya.prototype.getNewClientsToday.mockResolvedValue([]);
      MockApiSankhya.prototype.getFirstGeneratorLinks.mockResolvedValue([]);
      MockApiSankhya.prototype.getFirstInvoices.mockResolvedValue([]);
      MockApiSankhya.prototype.getIssuedInvoices.mockResolvedValue([mockIssuedInvoice] as never);
      MockApiSankhya.prototype.getDueInvoices.mockResolvedValue([]);
      MockApiSankhya.prototype.getOverdueInvoices5Days.mockResolvedValue([]);
      MockApiSankhya.prototype.getOverdueInvoices15Days.mockResolvedValue([]);

      const result = await processAllSankhyaNotifications();

      expect(MockApiSankhya.prototype.getIssuedInvoices).toHaveBeenCalled();
      expect(result.notificationQuantity).toBeGreaterThan(0);
      console.log(`✓ NA 400: ${result.notificationQuantity} notification(s) sent to ${TARGET_PHONE}`);
    });
  });

  describe.skip('NA 500 - Due Today Notification', () => {
    it('should send NA 500 notification via Blip API with mocked Sankhya response', async () => {
      const mockDueInvoice = {
        mes: 11,
        ano: 2025,
        nomeParceiro: 'Test Client NA500',
        cgcCpf: '33333333000333',
        dataInclusao: '2025-11-28T10:00:00',
        telefone: TARGET_PHONE,
        linkFatura: 'https://drive.google.com/file/d/1yrA6LK4AAns4c_ulDYMh6kuh-RBLuPEg',
        valor: 'R$ 2.500,00',
      };

      MockApiSankhya.prototype.getNewClientsToday.mockResolvedValue([]);
      MockApiSankhya.prototype.getFirstGeneratorLinks.mockResolvedValue([]);
      MockApiSankhya.prototype.getFirstInvoices.mockResolvedValue([]);
      MockApiSankhya.prototype.getIssuedInvoices.mockResolvedValue([]);
      MockApiSankhya.prototype.getDueInvoices.mockResolvedValue([mockDueInvoice] as never);
      MockApiSankhya.prototype.getOverdueInvoices5Days.mockResolvedValue([]);
      MockApiSankhya.prototype.getOverdueInvoices15Days.mockResolvedValue([]);

      const result = await processAllSankhyaNotifications();

      expect(MockApiSankhya.prototype.getDueInvoices).toHaveBeenCalled();
      expect(result.notificationQuantity).toBeGreaterThan(0);
      console.log(`✓ NA 500: ${result.notificationQuantity} notification(s) sent to ${TARGET_PHONE}`);
    });
  });

  describe.skip('NA 600 - Overdue 5 Days Notification', () => {
    it('should send NA 600 notification via Blip API with mocked Sankhya response', async () => {
      const mockOverdueInvoice5d = {
        diasVencido: 5,
        mes: 11,
        ano: 2025,
        nomeParceiro: 'Test Client NA600',
        cgcCpf: '44444444000444',
        dataInclusao: '2025-11-28T10:00:00',
        dataVencimento: '23/11/2025',
        telefone: TARGET_PHONE,
        linkFatura: 'https://drive.google.com/file/d/1yrA6LK4AAns4c_ulDYMh6kuh-RBLuPEg',
      };

      MockApiSankhya.prototype.getNewClientsToday.mockResolvedValue([]);
      MockApiSankhya.prototype.getFirstGeneratorLinks.mockResolvedValue([]);
      MockApiSankhya.prototype.getFirstInvoices.mockResolvedValue([]);
      MockApiSankhya.prototype.getIssuedInvoices.mockResolvedValue([]);
      MockApiSankhya.prototype.getDueInvoices.mockResolvedValue([]);
      MockApiSankhya.prototype.getOverdueInvoices5Days.mockResolvedValue([mockOverdueInvoice5d] as never);
      MockApiSankhya.prototype.getOverdueInvoices15Days.mockResolvedValue([]);

      const result = await processAllSankhyaNotifications();

      expect(MockApiSankhya.prototype.getOverdueInvoices5Days).toHaveBeenCalled();
      expect(result.notificationQuantity).toBeGreaterThan(0);
      console.log(`✓ NA 600: ${result.notificationQuantity} notification(s) sent to ${TARGET_PHONE}`);
    });
  });

  describe('NA 700 - Overdue 15 Days Notification', () => {
    it('should send NA 700 notification via Blip API with mocked Sankhya response', async () => {
      const mockOverdueInvoice15d = {
        diasVencido: 15,
        mes: 11,
        ano: 2025,
        nomeParceiro: 'Test Client NA700',
        cgcCpf: '55555555000555',
        dataInclusao: '2025-11-28T10:00:00',
        dataVencimento: '13/11/2025',
        telefone: TARGET_PHONE,
        linkFatura: 'https://drive.google.com/file/d/1yrA6LK4AAns4c_ulDYMh6kuh-RBLuPEg',
      };

      MockApiSankhya.prototype.getNewClientsToday.mockResolvedValue([]);
      MockApiSankhya.prototype.getFirstGeneratorLinks.mockResolvedValue([]);
      MockApiSankhya.prototype.getFirstInvoices.mockResolvedValue([]);
      MockApiSankhya.prototype.getIssuedInvoices.mockResolvedValue([]);
      MockApiSankhya.prototype.getDueInvoices.mockResolvedValue([]);
      MockApiSankhya.prototype.getOverdueInvoices5Days.mockResolvedValue([]);
      MockApiSankhya.prototype.getOverdueInvoices15Days.mockResolvedValue([mockOverdueInvoice15d] as never);

      const result = await processAllSankhyaNotifications();

      expect(MockApiSankhya.prototype.getOverdueInvoices15Days).toHaveBeenCalled();
      expect(result.notificationQuantity).toBeGreaterThan(0);
      console.log(`✓ NA 700: ${result.notificationQuantity} notification(s) sent to ${TARGET_PHONE}`);
    });
  });

  describe.skip('All Notifications in Single Run', () => {
    it('should send all NA 100-700 notifications in one orchestration', async () => {
      const mockNewClient = {
        nomeParceiro: 'Test All NA100',
        cgcCpf: '12345678000190',
        dataAssinatura: '28/11/2025',
        percentualDesconto: 0.1,
        telefone: TARGET_PHONE,
      };

      const mockGeneratorLink = {
        mes: 11,
        ano: 2025,
        nomeParceiro: 'Test All NA200',
        cgcCpf: '87654321000199',
        dataInclusao: '2025-11-28T10:00:00',
        telefone: TARGET_PHONE,
      };

      const mockFirstInvoice = {
        mes: 11,
        ano: 2025,
        nomeParceiro: 'Test All NA300',
        cgcCpf: '11111111000111',
        dataInclusao: '2025-11-28T10:00:00',
        telefone: TARGET_PHONE,
        linkFatura: 'https://drive.google.com/file/d/1yrA6LK4AAns4c_ulDYMh6kuh-RBLuPEg',
      };

      const mockIssuedInvoice = {
        mes: 11,
        ano: 2025,
        nomeParceiro: 'Test All NA400',
        cgcCpf: '22222222000222',
        dataInclusao: '2025-11-28T10:00:00',
        telefone: TARGET_PHONE,
        linkFatura: 'https://drive.google.com/file/d/1yrA6LK4AAns4c_ulDYMh6kuh-RBLuPEg',
        dataVencimento: '03/12/2025',
      };

      const mockDueInvoice = {
        mes: 11,
        ano: 2025,
        nomeParceiro: 'Test All NA500',
        cgcCpf: '33333333000333',
        dataInclusao: '2025-11-28T10:00:00',
        telefone: TARGET_PHONE,
        linkFatura: 'https://drive.google.com/file/d/1yrA6LK4AAns4c_ulDYMh6kuh-RBLuPEg',
        valor: 'R$ 2.500,00',
      };

      const mockOverdueInvoice5d = {
        diasVencido: 5,
        mes: 11,
        ano: 2025,
        nomeParceiro: 'Test All NA600',
        cgcCpf: '44444444000444',
        dataInclusao: '2025-11-28T10:00:00',
        dataVencimento: '23/11/2025',
        telefone: TARGET_PHONE,
        linkFatura: 'https://drive.google.com/file/d/1yrA6LK4AAns4c_ulDYMh6kuh-RBLuPEg',
      };

      const mockOverdueInvoice15d = {
        diasVencido: 15,
        mes: 11,
        ano: 2025,
        nomeParceiro: 'Test All NA700',
        cgcCpf: '55555555000555',
        dataInclusao: '2025-11-28T10:00:00',
        dataVencimento: '13/11/2025',
        telefone: TARGET_PHONE,
        linkFatura: 'https://drive.google.com/file/d/1yrA6LK4AAns4c_ulDYMh6kuh-RBLuPEg',
      };

      MockApiSankhya.prototype.getNewClientsToday.mockResolvedValue([mockNewClient] as never);
      MockApiSankhya.prototype.getFirstGeneratorLinks.mockResolvedValue([mockGeneratorLink] as never);
      MockApiSankhya.prototype.getFirstInvoices.mockResolvedValue([mockFirstInvoice] as never);
      MockApiSankhya.prototype.getIssuedInvoices.mockResolvedValue([mockIssuedInvoice] as never);
      MockApiSankhya.prototype.getDueInvoices.mockResolvedValue([mockDueInvoice] as never);
      MockApiSankhya.prototype.getOverdueInvoices5Days.mockResolvedValue([mockOverdueInvoice5d] as never);
      MockApiSankhya.prototype.getOverdueInvoices15Days.mockResolvedValue([mockOverdueInvoice15d] as never);

      const result = await processAllSankhyaNotifications();

      // Verify all processors were called
      expect(MockApiSankhya.prototype.getNewClientsToday).toHaveBeenCalled();
      expect(MockApiSankhya.prototype.getFirstGeneratorLinks).toHaveBeenCalled();
      expect(MockApiSankhya.prototype.getFirstInvoices).toHaveBeenCalled();
      expect(MockApiSankhya.prototype.getIssuedInvoices).toHaveBeenCalled();
      expect(MockApiSankhya.prototype.getDueInvoices).toHaveBeenCalled();
      expect(MockApiSankhya.prototype.getOverdueInvoices5Days).toHaveBeenCalled();
      expect(MockApiSankhya.prototype.getOverdueInvoices15Days).toHaveBeenCalled();

      // Expect 7 notifications total (one for each type)
      expect(result.notificationQuantity).toBe(7);
      console.log(`✓ All 7 notifications (NA 100-700) sent to ${TARGET_PHONE}`);
    });
  });
});

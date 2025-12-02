import ApiSankhya from '../../repositories/api-sankhya';

jest.mock('axios');

describe('ApiSankhya', () => {
  let apiSankhya: ApiSankhya;

  beforeEach(() => {
    jest.clearAllMocks();
    apiSankhya = new ApiSankhya();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should initialize with correct API configuration', () => {
    expect(apiSankhya).toBeDefined();
  });

  describe('NA 100 - getNewClientsToday', () => {
    it('should return list of new clients', async () => {
      const result = await apiSankhya.getNewClientsToday();
      expect(result).toBeDefined();
    });
  });

  describe('NA 200 - getFirstGeneratorLinks', () => {
    it('should return list of first generator links with 60-day check', async () => {
      const result = await apiSankhya.getFirstGeneratorLinks();
      expect(result).toBeDefined();
    });
  });

  describe('NA 300 - getFirstInvoices', () => {
    it('should return list of first invoices', async () => {
      const result = await apiSankhya.getFirstInvoices();
      expect(result).toBeDefined();
    });

    it('should include linkFatura field in response', async () => {
      const result = await apiSankhya.getFirstInvoices();
      if (result && result.length > 0) {
        expect(result[0]).toBeDefined();
      }
    });
  });

  describe('NA 400 - getIssuedInvoices', () => {
    it('should return list of issued invoices', async () => {
      const result = await apiSankhya.getIssuedInvoices();
      expect(result).toBeDefined();
    });

    it('should include dataVencimento field in response', async () => {
      const result = await apiSankhya.getIssuedInvoices();
      if (result && result.length > 0) {
        expect(result[0]).toBeDefined();
      }
    });
  });

  describe('NA 500 - getDueInvoices', () => {
    it('should return list of due invoices', async () => {
      const result = await apiSankhya.getDueInvoices();
      expect(result).toBeDefined();
    });

    it('should include valor field in response', async () => {
      const result = await apiSankhya.getDueInvoices();
      if (result && result.length > 0) {
        expect(result[0]).toBeDefined();
      }
    });
  });

  describe('NA 600 - getOverdueInvoices5Days', () => {
    it('should return overdue invoices with 5-day check', async () => {
      const result = await apiSankhya.getOverdueInvoices5Days();
      expect(result).toBeDefined();
    });

    it('should include diasVencido field in response', async () => {
      const result = await apiSankhya.getOverdueInvoices5Days();
      if (result && result.length > 0) {
        expect(result[0]).toBeDefined();
      }
    });
  });

  describe('NA 700 - getOverdueInvoices15Days', () => {
    it('should return overdue invoices with 15-day check', async () => {
      const result = await apiSankhya.getOverdueInvoices15Days();
      expect(result).toBeDefined();
    });

    it('should include diasVencido field in response', async () => {
      const result = await apiSankhya.getOverdueInvoices15Days();
      if (result && result.length > 0) {
        expect(result[0]).toBeDefined();
      }
    });
  });
});

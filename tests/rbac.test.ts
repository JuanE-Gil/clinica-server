import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_clinic_key';

// Mocks para evitar cargar la lógica de negocio pesada y dependencias nativas
jest.unstable_mockModule('../src/controllers/product.controller.js', () => ({
  getAllProducts: (req: any, res: any) => res.json({ status: 'success', data: [] }),
  getInventoryReport: (req: any, res: any) => {
    res.setHeader('Content-Type', 'application/pdf');
    return res.end(Buffer.from('fake pdf content'));
  },
  getProductById: (req: any, res: any) => res.json({ status: 'success', data: {} }),
  createNewProduct: (req: any, res: any) => res.status(201).json({ status: 'success' }),
  updateProduct: (req: any, res: any) => res.json({ status: 'success' }),
  deleteProduct: (req: any, res: any) => res.json({ status: 'success' }),
}));

// Mock de pdfmake y dependencias relacionadas
jest.unstable_mockModule('../src/utils/pdf/config.js', () => ({
    printer: {
        createPdfKitDocument: jest.fn().mockReturnValue({
            on: jest.fn(),
            end: jest.fn(),
        }),
    },
}));

jest.unstable_mockModule('../src/utils/pdf/index.js', () => ({
    generateInventoryReportPdf: jest.fn().mockResolvedValue(Buffer.from('fake pdf')),
    generateClinicalReportPdf: jest.fn().mockResolvedValue(Buffer.from('fake pdf')),
    generateManagementReportPdf: jest.fn().mockResolvedValue(Buffer.from('fake pdf')),
}));

const appModule = await import('../src/app.js');
const app = appModule.default;
const { registerRoutes } = appModule;
const productRoutes = (await import('../src/v1/routes/product.routes.js')).default;

describe('RBAC and URL Access', () => {
  beforeAll(() => {
    registerRoutes([{ path: '/products', router: productRoutes }]);
  });

  const createToken = (role: string) => {
    return jwt.sign({ id: 1, role }, JWT_SECRET);
  };

  it('should deny access if no token is provided', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('TOKEN_REQUIRED');
  });

  it('should allow any authenticated user to list products', async () => {
    const token = createToken('user');
    const res = await request(app)
      .get('/api/v1/products')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
  });

  it('should allow nurse to list products', async () => {
    const token = createToken('nurse');
    const res = await request(app)
      .get('/api/v1/products')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
  });

  it('should deny non-admin users from creating products', async () => {
    const token = createToken('nurse');
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test' });
    
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('should allow admin to create products', async () => {
    const token = createToken('admin');
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test', price_cost: 10, price_sale: 20, amount: 100 });
    
    expect(res.status).toBe(201);
  });

  it('should allow downloading PDF report for authenticated users', async () => {
    const token = createToken('user');
    const res = await request(app)
      .get('/api/v1/products/report')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('application/pdf');
  });
});

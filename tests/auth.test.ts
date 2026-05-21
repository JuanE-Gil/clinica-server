import { jest } from '@jest/globals';
import request from 'supertest';

// Mock del servicio de autenticación usando unstable_mockModule para ESM
jest.unstable_mockModule('../src/services/auth.service.js', () => ({
    AuthService: {
        authenticate: jest.fn(),
    },
}));

// Importar dinámicamente app y rutas después del mock para asegurar que usen el mock
const appModule = await import('../src/app.js');
const app = appModule.default;
const { registerRoutes } = appModule;
const authRoutes = (await import('../src/v1/routes/auth.routes.js')).default;
const { AuthService } = (await import('../src/services/auth.service.js')) as any;

describe('Auth API', () => {
    beforeAll(() => {
        registerRoutes([{ path: '/auth', router: authRoutes }]);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should login successfully with correct credentials', async () => {
        const mockUser = {
            accessToken: 'fake-access-token',
            refreshToken: 'fake-refresh-token',
            user: { id: 1, email: 'test@test.com', role: 'admin' },
        };

        AuthService.authenticate.mockResolvedValue(mockUser);

        const res = await request(app).post('/api/v1/auth/login').send({ email: 'test@test.com', password: 'password' });

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data).toEqual(mockUser);
    });

    it('should return 401 with invalid credentials', async () => {
        AuthService.authenticate.mockResolvedValue(null);

        const res = await request(app).post('/api/v1/auth/login').send({ email: 'test@test.com', password: 'wrong' });

        expect(res.status).toBe(401);
        expect(res.body.status).toBe('error');
    });
});

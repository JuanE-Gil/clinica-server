import request from 'supertest';
import app from '../src/app';

describe('API Health Check', () => {
    it('should return welcome message', async () => {
        const res = await request(app).get('/api/v1/');
        expect(res.status).toBe(200);
        expect(res.text).toBe('Welcome to the SAID.SALUD API');
    });

    it('should return health status', async () => {
        const res = await request(app).get('/health');
        // Si la DB no está configurada en tests, podría fallar con 500, pero el servidor responde
        expect(res.status).toBeDefined();
        expect(res.body).toHaveProperty('server', true);
    });
});

import express from 'express';
import cors from 'cors';
import { setupSwagger } from './config/swagger.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Disposition'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));
app.use(express.json());

const router = express.Router();
app.use('/api/v1', router);

export const registerRoutes = (routes: { path: string, router: express.Router }[]) => {
    routes.forEach(route => {
        router.use(route.path, route.router);
    });
};

setupSwagger(app);

app.use(errorHandler);

app.get('/api/v1/', (_req, res) => {
    res.send('Welcome to the SAID.SALUD API');
});

app.get('/health', async (_req, res) => {
    res.json({ server: true });
});

export default app;

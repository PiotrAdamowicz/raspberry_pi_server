import express from 'express';
import path from 'path';
import uploadRoutes from './routes/upload.route.js';
import { __dirname } from './helpers/file-path.js';

const app = express();

app.use('/images', express.static(path.join(__dirname, 'storage')));

app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({ ok: true });
});

app.use('/', uploadRoutes);

export default app;
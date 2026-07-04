import app from './app.js';
import { logLine } from './helpers/colors.js';

app.listen(3000, '127.0.0.1', () => {
    logLine('server', 'listening on http://127.0.0.1:3000');
});
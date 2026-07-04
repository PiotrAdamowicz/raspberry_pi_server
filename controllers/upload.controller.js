import path from 'path';
import fs from 'fs/promises';
import crypto from 'node:crypto';
import { processImageVariants } from '../services/image.service.js';
import { ensureDir } from '../helpers/ensure-dir.js';
import { logHeader, logLine, logErr } from '../helpers/colors.js';
import { STORAGE } from '../helpers/file-path.js';
import { __dirname } from '../helpers/file-path.js';

async function uploadImage(req, res) {
    logHeader('/upload start');

    try {
        logLine('upload body', req.body);
        logLine('upload file', req.file);

        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const id = crypto.randomUUID();

        const derivedDir = path.join(STORAGE, 'derived');
        const thumbDir = path.join(derivedDir, 'thumb');
        const cardDir = path.join(derivedDir, 'card');
        const tmpDir = path.join(__dirname, '..', 'tmp');

        await ensureDir(tmpDir);
        await ensureDir(STORAGE);
        await ensureDir(derivedDir);
        await ensureDir(thumbDir);
        await ensureDir(cardDir);

        const thumbName = `${id}.jpg`;
        const cardName = `${id}.jpg`;

        const thumbPath = path.join(thumbDir, thumbName);
        const cardPath = path.join(cardDir, cardName);

        logHeader('paths');
        logLine('temp', req.file.path);
        logLine('thumbPath', thumbPath);
        logLine('cardPath', cardPath);

        await processImageVariants({
            inputPath: req.file.path,
            thumbPath,
            cardPath
        });

        logLine('cleanup temp.remove', req.file.path);
        await fs.unlink(req.file.path);
        logLine('cleanup', 'temp.removed');

        const responseBody = {
            id,
            images: {
                thumb: `/images/derived/thumb/${thumbName}`,
                card: `/images/derived/card/${cardName}`
            }
        };

        logLine('response success', responseBody);

        return res.status(200).json(responseBody);
    } catch (error) {
        logErr('upload.error', error);

        if (req.file?.path) {
            try {
                await fs.unlink(req.file.path);
                logLine('cleanup after-error.removed', req.file.path);
            } catch (cleanupError) {
                logErr('[cleanup] after-error.failed', cleanupError);
            }
        }

        return res.status(500).json({
            error: 'Image processing failed',
            message: error.message
        });
    }
}

export { uploadImage };
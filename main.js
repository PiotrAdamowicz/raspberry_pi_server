const express = require('express');
const multer = require('multer');
const { Jimp } = require('jimp');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('node:crypto');
const { logHeader,
    logLine,
    logOk,
    logWarn,
    logErr,
    C
} = require('./helpers/colors');

const app = express();
const upload = multer({ dest: 'tmp/' });

const STORAGE = path.join(__dirname, 'storage');

app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({ ok: true });
});

async function ensureDir(dirPath) {
    const exists = fs.existsSync(dirPath);

    if (exists) {
        logLine('[ensureDir] exists:', dirPath);
        return;
    }

    logLine('[ensureDir] creating:', dirPath);
    await fsp.mkdir(dirPath, { recursive: true });
    logLine('[ensureDir] created:', dirPath);
}

app.post('/upload', upload.single('image'), async (req, res) => {
    logHeader('/upload start', C.bgBlue);

    try {
        logLine('[upload] body:', req.body);
        logLine('[upload] file:', req.file);

        if (!req.file) {
            logLine('[upload] no file received');
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const id = crypto.randomUUID();

        const originalsDir = path.join(STORAGE, 'originals');
        const derivedDir = path.join(STORAGE, 'derived');
        const thumbDir = path.join(derivedDir, 'thumb');
        const cardDir = path.join(derivedDir, 'card');
        const fullDir = path.join(derivedDir, 'full');
        const tmpDir = path.join(__dirname, 'tmp');

        logHeader('[paths] directories', C.bgGreen);
        logLine('[paths] STORAGE:', STORAGE);
        logLine('[paths] originalsDir:', originalsDir);
        logLine('[paths] derivedDir:', derivedDir);
        logLine('[paths] thumbDir:', thumbDir);
        logLine('[paths] cardDir:', cardDir);
        logLine('[paths] fullDir:', fullDir);
        logLine('[paths] tmpDir:', tmpDir);

        await ensureDir(tmpDir);
        await ensureDir(STORAGE);
        await ensureDir(originalsDir);
        await ensureDir(derivedDir);
        await ensureDir(thumbDir);
        await ensureDir(cardDir);
        await ensureDir(fullDir);

        const originalName = `${id}.jpg`;
        const thumbName = `${id}.jpg`;
        const cardName = `${id}.jpg`;
        const fullName = `${id}.jpg`;

        const originalPath = path.join(originalsDir, originalName);
        const thumbPath = path.join(thumbDir, thumbName);
        const cardPath = path.join(cardDir, cardName);
        const fullPath = path.join(fullDir, fullName);

        logLine('[paths] temp upload path:', req.file.path);
        logLine('[paths] originalPath:', originalPath);
        logLine('[paths] thumbPath:', thumbPath);
        logLine('[paths] cardPath:', cardPath);
        logLine('[paths] fullPath:', fullPath);


        logHeader('JIMP', C.magenta);
        logLine('[jimp]','reading original upload');
        const image = await Jimp.read(req.file.path);
        logLine('[jimp]','read success');

        logLine('[jimp]','writing original');
        const originalImage = await Jimp.read(req.file.path);
        await originalImage.write(originalPath);
        logLine('[jimp]','original written');

        logLine('[jimp]','writing thumb');
        const thumbImage = await Jimp.read(req.file.path);
        thumbImage.resize({ w: 160 });
        await thumbImage.write(thumbPath);
        logLine('[jimp]','thumb written');

        logLine('[jimp]','writing card');
        const cardImage = await Jimp.read(req.file.path);
        cardImage.resize({ w: 480 });
        await cardImage.write(cardPath);
        logLine('[jimp]','card written');

        logLine('[jimp]','writing full');
        const fullImage = await Jimp.read(req.file.path);
        fullImage.resize({ w: 1200 });
        await fullImage.write(fullPath);
        logLine('[jimp]','full written');

        logLine('[cleanup]', 'removing temp file:', req.file.path);
        await fsp.unlink(req.file.path);
        logLine('[cleanup]', ' temp file removed');

        const responseBody = {
            id,
            images: {
                original: `/images/originals/${originalName}`,
                thumb: `/images/derived/thumb/${thumbName}`,
                card: `/images/derived/card/${cardName}`,
                full: `/images/derived/full/${fullName}`
            }
        };

        logLine('[response] success:', responseBody);
        logLine('--- /upload end success ---');

        return res.status(200).json(responseBody);
    } catch (error) {
        logErr('--- /upload error ---');
        logErr(error);

        if (req.file?.path) {
            try {
                logLine('[cleanup] trying to remove temp file after error:', req.file.path);
                await fsp.unlink(req.file.path);
                logLine('[cleanup] temp file removed after error');
            } catch (cleanupError) {
                logErr('[cleanup] failed to remove temp file:', cleanupError);
            }
        }

        return res.status(500).json({
            error: 'Image processing failed',
            message: error.message
        });
    }
});

app.listen(3000, '127.0.0.1', () => {
    logLine('Server listening on http://127.0.0.1:3000');
});
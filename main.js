const express = require('express');
const multer = require('multer');
const { Jimp } = require('jimp');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('node:crypto');

const app = express();
const upload = multer({ dest: 'tmp/' });

const STORAGE = path.join(__dirname, 'storage');

app.use(express.json());

app.get('/health', (_req, res) => {
    res.json({ ok: true });
});

app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const id = crypto.randomUUID();
        const image = await Jimp.read(req.file.path);

        const thumbName = `${id}.jpg`;
        const cardName = `${id}.jpg`;
        const fullName = `${id}.jpg`;

        const thumbPath = path.join(STORAGE, 'derived', 'thumb', thumbName);
        const cardPath = path.join(STORAGE, 'derived', 'card', cardName);
        const fullPath = path.join(STORAGE, 'derived', 'full', fullName);

        console.log("PATH: ", thumbPath)
        await image.resize({ w: 160 }).write(thumbPath);
        await image.resize({ w: 480 }).write(cardPath);
        await image.resize({ w: 1200 }).write(fullPath);

        await fs.unlink(req.file.path);

        res.json({
            id,
            images: {
                thumb: `/images/derived/thumb/${thumbName}`,
                card: `/images/derived/card/${cardName}`,
                full: `/images/derived/full/${fullName}`
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Image processing failed' });
    }
});

app.listen(3000, '127.0.0.1', () => {
    console.log('Server listening on http://127.0.0.1:3000');
});
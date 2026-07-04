import { Jimp } from 'jimp';
import { logHeader, logLine } from '../helpers/colors.js';

async function processImageVariants({ inputPath, thumbPath, cardPath }) {
    logHeader('jimp');

    logLine('jimp read.thumb.start', inputPath);
    const thumbImage = await Jimp.read(inputPath);
    logLine('jimp', 'read.thumb.done');

    thumbImage.resize({ w: 160 });
    logLine('jimp write.thumb.start', thumbPath);
    await thumbImage.write(thumbPath);
    logLine('jimp write.thumb.done', null);

    logLine('jimp read.card.start', inputPath);
    const cardImage = await Jimp.read(inputPath);
    logLine('jimp read.card.done', null);

    cardImage.resize({ w: 480 });
    logLine('jimp write.card.start', cardPath);
    await cardImage.write(cardPath);
    logLine('jimp write.card.done', null);
}

export { processImageVariants };
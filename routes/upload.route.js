import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadImage } from '../controllers/upload.controller.js';
import { __dirname } from '../helpers/file-path.js';

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, '..', 'tmp') });

router.post('/upload', upload.single('image'), uploadImage);

export default router;
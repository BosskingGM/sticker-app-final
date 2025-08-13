const express = require('express');
const axios = require('axios');
const multer = require('multer');
const cors = require('cors');
const FormData = require('form-data');
const serverless = require('serverless-http');

const app = express();
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());

router.post('/', upload.single('image_file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo.' });
        }
        const apiKey = process.env.REMOVE_BG_API_KEY;
        if (!apiKey) {
             return res.status(500).json({ error: 'API Key no configurada en el servidor.' });
        }
        const formData = new FormData();
        formData.append('size', 'auto');
        formData.append('image_file', req.file.buffer, { filename: req.file.originalname });
        const response = await axios({
            method: 'post',
            url: 'https://api.removebg.com/v1/removebg',
            data: formData,
            responseType: 'arraybuffer',
            headers: {
                ...formData.getHeaders(),
                'X-Api-Key': apiKey,
            },
        });
        res.setHeader('Content-Type', 'image/png');
        res.status(200).send(response.data);
    } catch (error) {
        console.error('Error en la función:', error.message);
        res.status(500).json({ error: 'Error al procesar la imagen.' });
    }
});

app.use('/.netlify/functions/remove-background', router);
module.exports.handler = serverless(app);
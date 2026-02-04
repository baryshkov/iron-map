import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from "express";
import multer from 'multer';

const app = express();
const PORT = 3000;
const DATA_FILE = './places.json';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));


const readPlaces = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
};

const writePlaces = (places) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(places, null, 2));
};

// GET all places
app.get('/places', (req, res) => {
    res.json(readPlaces());
});

// POST new place
app.post('/places', (req, res) => {
    const places = readPlaces();
    const newPlace = {
        ...req.body,
        id: Date.now()
    };
    places.push(newPlace);
    writePlaces(places);
    res.status(201).json(newPlace);
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'public/images/places';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        console.log(file);
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
});

app.post('/upload', upload.single('image'), (req, res) => {
    try {
        // Файл уже сохранен с помощью multer
        res.send('Файл загружен');
    } catch (err) {
        console.log(req.file);
        console.error(err);
        res.status(500).send('Ошибка загрузки');
    }
});

// DELETE place
app.delete('/places/:id', (req, res) => {
    const id = Number(req.params.id);
    const places = readPlaces().filter(p => p.id !== id);
    writePlaces(places);
    res.sendStatus(204);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

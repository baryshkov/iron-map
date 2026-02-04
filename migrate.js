import fs from 'fs';
import path from 'path';

const INPUT = './places.json';
const OUTPUT = './places.fixed.json';
const IMAGES_DIR = './public/images/places';

// гарантируем папку
fs.mkdirSync(IMAGES_DIR, { recursive: true });

// читаем json
const raw = fs.readFileSync(INPUT, 'utf-8');
const places = JSON.parse(raw);

if (!Array.isArray(places)) {
    throw new Error('places.json должен быть массивом');
}

const isBase64Image = (str) =>
    typeof str === 'string' && str.startsWith('data:image/');

const parseBase64 = (dataUrl) => {
    const match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!match) return null;
    return {
        ext: match[1],
        data: match[2]
    };
};

const migrated = places.map((place) => {
    if (!isBase64Image(place.avatar)) {
        return place;
    }

    const parsed = parseBase64(place.avatar);
    if (!parsed) {
        console.warn(`Не удалось распарсить image у id=${place.id}`);
        return place;
    }

    const filename = `${place.id}.${parsed.ext}`;
    const filepath = path.join(IMAGES_DIR, filename);

    const buffer = Buffer.from(parsed.data, 'base64');
    fs.writeFileSync(filepath, buffer);

    return {
        ...place,
        avatar: `/images/places/${filename}`
    };
});

fs.writeFileSync(
    OUTPUT,
    JSON.stringify(migrated, null, 2)
);

console.log(`Готово. Обработано мест: ${migrated.length}`);

const fs = require('fs/promises');
const path = require('path');

const filePath = path.join(__dirname, '..', 'db.json');

async function readDB() {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error("Erreur lors de la lecture de db.json:", error);
        return { books: [] };
    }
}

async function writeDB(data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error("Erreur lors de l'écriture dans db.json:", error);
    }
}

module.exports = {
    readDB,
    writeDB
};

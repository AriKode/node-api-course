const http = require('http');
const router = require('./modules/router');

const PORT = 3000;

const server = http.createServer((req, res) => {
    // [ 1 pt ] Log de chaque requête dans le terminal
    res.on('finish', () => {
        const timestamp = new Date().toISOString(); // [2024-01-15T10:30:00.000Z]
        console.log(`[${timestamp}] ${req.method} ${req.url} → ${res.statusCode}`);
    });

    // Déléguer la gestion de la requête au router
    router(req, res);
});

server.listen(PORT, () => {
    console.log(`Server démarré sur le port ${PORT}`);
    console.log(`Essayez http://localhost:${PORT}/books`);
});

const { readDB, writeDB } = require('./db');

async function router(req, res) {
    // [ 1 pt ] Content-Type: application/json présent sur toutes les réponses
    res.setHeader('Content-Type', 'application/json');

    // On sépare le chemin des query parameters s'il y en a (ex: /books?available=true)
    const urlParts = req.url.split('?');
    const pathname = urlParts[0];
    const queryString = urlParts.length > 1 ? urlParts[1] : '';

    try { // [ 1 pt ] try/catch global dans le routeur

        // Route GET /books avec filtrage optionnel
        if (pathname === '/books' && req.method === 'GET') {
            const data = await readDB();
            let books = data.books;

            // [ 1 pt Bonus ] GET /books?available=true — Filtrage par disponibilité
            if (queryString && queryString.includes('available=true')) {
                books = books.filter(b => b.available === true);
            }

            res.writeHead(200);
            res.end(JSON.stringify({
                success: true,
                count: books.length,
                data: books
            }));
            return;
        }

        // Variable partagée pour les routes avec /:id
        const matchId = pathname.match(/^\/books\/([0-9]+)$/);
        
        // Route GET /books/:id (Un livre par ID)
        if (matchId && req.method === 'GET') {
            const id = parseInt(matchId[1], 10);
            const data = await readDB();
            
            const book = data.books.find(b => b.id === id);
            
            if (book) {
                res.writeHead(200);
                res.end(JSON.stringify({ success: true, data: book }));
            } else {
                res.writeHead(404);
                res.end(JSON.stringify({ success: false, error: "Livre introuvable" }));
            }
            return;
        }

        // [ 1 pt Bonus ] DELETE /books/:id — Supprimer un livre
        if (matchId && req.method === 'DELETE') {
            const id = parseInt(matchId[1], 10);
            const data = await readDB();

            const bookIndex = data.books.findIndex(b => b.id === id);

            if (bookIndex !== -1) {
                // Livre trouvé : on le supprime
                data.books.splice(bookIndex, 1);
                await writeDB(data);

                res.writeHead(200);
                res.end(JSON.stringify({ success: true, data: { message: "Livre supprimé avec succès" } }));
            } else {
                // Livre non trouvé
                res.writeHead(404);
                res.end(JSON.stringify({ success: false, error: "Livre introuvable" }));
            }
            return;
        }

        // Route POST /books (Ajouter un nouveau livre)
        if (pathname === '/books' && req.method === 'POST') {
            let body = '';
            
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                try {
                    const parsedBody = JSON.parse(body);
                    const { title, author, year } = parsedBody;

                    if (!title || !author || !year) {
                        res.writeHead(400);
                        res.end(JSON.stringify({ 
                            success: false, 
                            error: "Les champs title, author et year sont requis" 
                        }));
                        return;
                    }

                    const data = await readDB();

                    const newId = data.books.length > 0 
                        ? Math.max(...data.books.map(b => b.id)) + 1 
                        : 1;

                    const newBook = {
                        id: newId,
                        title,
                        author,
                        year,
                        available: true
                    };

                    data.books.push(newBook);
                    await writeDB(data);

                    res.writeHead(201);
                    res.end(JSON.stringify({ success: true, data: newBook }));
                } catch (error) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ success: false, error: "Données JSON invalides" }));
                }
            });
            return;
        }

        // Route racine
        if (pathname === '/' && req.method === 'GET') {
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, message: "Bienvenue sur l'API des livres" }));
            return;
        }

        // [ 1 pt ] Route 404 par défaut
        res.writeHead(404);
        res.end(JSON.stringify({ success: false, error: "Route non trouvée" }));

    } catch (error) {
        // [ 1 pt ] try/catch autour de la logique de routing, erreur 500 propre
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, error: "Erreur interne" }));
    }
}

module.exports = router;

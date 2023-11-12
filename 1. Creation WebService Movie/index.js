var express = require('express');
const accepts = require('express-accepts');
var app = express();
const port = 3000;

// Middleware pour le parsing du corps de la requête en JSON
app.use(express.json());

// Middleware pour gérer les formats de sortie JSON et XML
app.use(accepts('json', 'xml'));

// Le WebService en lui même
//     Il doit disposer de routes de récupération des films (en listing, et récupération d’entité)
//     Il doit être possible de modifier un film
//     Il doit être possible de créer un film
//     Il doit être possible de supprimer un film

// Le film
// L’entité film doit disposer au minimum des éléments suivants :
//     Le nom (texte libre, maximum 128 charactères)
//     La description (texte libre, maximum 2048 charactères)
//     La date de parution (date format ISO 8601)
//     La note (entier entre 0 et 5, optionel)

// Les codes de retour minimum
// A minima les codes de retour suivant doivent être implémentés :
//     200 pour une récupération de ressource ou listing ou modification avec succès
//     201 création avec succès
//     404 ressource absente
//     422 validation impossible

// Et tout autre code a votre convenance du moment que sa description (https://fr.wikipedia.org/wiki/Liste_des_codes_HTTP) reste cohérente

// Le petit plus, les formats de sortie
// Dans l’idéale, deux formats de sortie doivent être gérer :
//     JSON
//     XML
// Ces formats seront explicités via le header Accept

// Le bonus, la doc générer
// La cerise sur le gâteau, l’implémentation de la documentation OpenAPI.
// Bien entendu c’est de l’extra.
// https://swagger.io/specification/


// Liste de films
const films = [
    {
      id: 1,
      name: 'Film 1',
      description: 'Description du Film 1',
      releaseDate: '2023-01-01',
      rating: 4,
    },
    {
      id: 2,
      name: 'Film 2',
      description: 'Description du Film 2',
      releaseDate: '2023-02-15',
      rating: 3,
    },
    // Ajout d'autres films ici...
];

// Endpoint pour récupérer la liste de films
app.get('/films', (req, res) => {
  res.json(films);
});

// Endpoint pour récupérer un film par son ID
app.get('/films/:id', (req, res) => {
    const filmId = parseInt(req.params.id);
    const film = films.find(f => f.id === filmId);

    if (film) {
        res.status(200).json(film);
    } else {
        res.status(404).json({ error: 'Film non trouvé' });
    }
});

// Endpoint pour ajouter un nouveau film
app.post('/films', (req, res) => {
    const newFilm = req.body;
  
    // Vérifications de validation
    if (!newFilm.name || !newFilm.description || !newFilm.releaseDate) {
        res.status(422).json({ error: 'Validation impossible. Assurez-vous de fournir le nom, la description et la date de parution.' });
    } else {
        films.push(newFilm);
        const format = req.accepts(['json', 'xml']);

        switch (format) {
        case 'json':
            res.status(201).json(newFilm);
            break;
        case 'xml':
            // Implémenter la logique pour la sortie XML
            res.status(201).send(`<film><id>${newFilm.id}</id><name>${newFilm.name}</name></film>`);
            break;
        default:
            res.status(406).send('Not Acceptable');
        }
    }
});

// Endpoint pour modifier un film par son ID
app.put('/films/:id', (req, res) => {
    const filmId = parseInt(req.params.id);
    const updatedFilm = req.body;
  
    const index = films.findIndex(f => f.id === filmId);
  
    if (index !== -1) {
      films[index] = { ...films[index], ...updatedFilm };
      res.status(200).json(films[index]);
    } else {
      res.status(404).json({ error: 'Film non trouvé' });
    }
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Le serveur écoute sur le port ${port}`);
});

Dans cet exemple, j'ai ajouté le middleware express-accepts pour gérer les en-têtes Accept des requêtes. En fonction de la valeur de l'en-tête Accept, le serveur renvoie la réponse dans le format approprié (JSON ou XML). Note que la logique pour la sortie XML est simplifiée et peut nécessiter un module supplémentaire pour une gestion plus avancée des formats XML.

});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Le serveur écoute sur le port ${port}`);
});

// GET method route
app.get('/', function (req, res) {
    res.send('GET request to the homepage');
});

// POST method route
app.post('/', function (req, res) {
    res.send('POST request to the homepage');
});
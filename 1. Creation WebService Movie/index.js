var express = require('express');
// const accepts = require('express-accepts');
var app = express();
const port = 3000;
const films = require('./films.json');

console.log(films.length)

// Middleware pour le parsing du corps de la requête en JSON
app.use(express.json());

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


// MAJ pour le rendu du 15 décembre 2023
//
// Il doit permettre de rechercher par titre ou par description (petit indice, sur une route de collection on peu passer des paramètres , les query)
// Le résultat doit être paginé (page 1 sur 22, 10 éléments par page par exemple)
// Un film doit être attaché à une ou plusieurs catégories
// On doit pouvoir lister les catégories d’un film et inversement (la notions des sous-ressources et leurs URI)
// Il faut penser au développeur qui va utiliser le webservice … Personne ne lit la doc (RTFM en est né), il devra pouvoir retourner du JSON HAL


// GET method route
app.get('/', function (req, res) {
    res.send('GET request to the homepage');
});

// POST method route
app.post('/', function (req, res) {
    res.send('POST request to the homepage');
});

// Endpoint pour récupérer les films
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


app.get('/page/:page', (req, res) => {
    // Récupérer les paramètres de la requête pour la pagination
    const page = parseInt(req.params.page) || 1;
    const pageSize = 10;
  
    // Calculer l'indice de départ pour la pagination
    const startIndex = (page - 1) * pageSize;
  
    // Extraire les films pour la page actuelle
    const paginatedFilms = films.slice(startIndex, startIndex + pageSize);
  
    // Envoyer les films paginés en réponse
    res.json(paginatedFilms);
  });



// Démarrer le serveur
app.listen(port, () => {
  console.log(`Le serveur écoute sur le port ${port}`);
});
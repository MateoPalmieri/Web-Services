var express = require('express');
var app = express();
const port = 3000;
const fs = require('fs');
const films = require('./films.json');

// Middleware to parse request body in JSON
app.use(express.json());

// Le WebService en lui même
//     ✅ Il doit disposer de routes de récupération des films (en listing, et récupération d’entité)
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
//     ✅ 200 pour une récupération de ressource ou listing ou modification avec succès
//     201 création avec succès
//     ✅ 404 ressource absente
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
// ⬛ Il doit permettre de rechercher par titre ou par description (petit indice, sur une route de collection on peu passer des paramètres , les query)
// ✅ Le résultat doit être paginé (page 1 sur 22, 10 éléments par page par exemple)
// ✅ Un film doit être attaché à une ou plusieurs catégories
// ⬛ On doit pouvoir lister les catégories d’un film et inversement (la notions des sous-ressources et leurs URI)
// Il faut penser au développeur qui va utiliser le webservice … Personne ne lit la doc (RTFM en est né), il devra pouvoir retourner du JSON HAL


// Endpoint to get every films
app.get('/films', (req, res) => {
    res.json(films);
});


// Endpoint to get a film by his ID
app.get('/films/:id', (req, res) => {
    const filmId = parseInt(req.params.id);
    const film = films.find(f => f.id === filmId);

    if (film) {
        res.status(200).json(film);
    } else {
        res.status(404).json({ error: 'Film not found' });
    }
});


// Endpoint to delete a film by his ID
app.delete('/films/delete/:id', (req, res) => {

  // Recherche du film dans la liste
  const filmId = parseInt(req.params.id);
  const film = films.findIndex((film) => film.id === filmId);

  if (film !== -1) {
    // Delete the movie
    films.splice(film, 1);

    // Save the modification
    fs.writeFile('./films.json', JSON.stringify(films, null, 2));

    res.json({ success: true, message: 'Film deleted.' });
  } else {
    res.status(404).json({ success: false, message: 'Film not found.' });
  }
});


// Endpoint to add a new film
app.post('/films', (req, res) => {
    const newFilm = req.body;
  
    // Verify if everything is correct
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


// Endpoint to modify a film by his ID
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
    // Get parameters
    const page = parseInt(req.params.page) || 1;
    const pageSize = 10;
  
    // Calculate index for pagination
    const startIndex = (page - 1) * pageSize;
  
    // Extracts films for the actual page
    const paginatedFilms = films.slice(startIndex, startIndex + pageSize);
  
    // Send paginated films in response
    res.json(paginatedFilms);
});


// Start the server
app.listen(port, () => {
  console.log(`Le serveur écoute sur le port ${port}`);
});
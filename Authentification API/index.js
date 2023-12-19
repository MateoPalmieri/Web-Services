const express = require('express');
var app = express();
const port = 3000;
const jwt = require('jsonwebtoken');

const bodyParser = require('body-parser');
const fs = require('fs/promises');

const secretKey = 'secretKey';
const accessTokenExpiration = 30 * 60;
const refreshTokenExpiration = 120 * 60;

app.use(express.json());


const users = require('./users.json');


// Endpoint User account creation
/*
    "login": "string",
    "password": "string",
    "role": [
        "string"
    ],
    "status": "string"

    Renvoi un compte utilisateur
*/
app.post('/api/account', (req, res) => {


    // Créer un objet utilisateur
    const user = {
        login: req.body.login,
        password: req.body.password,
        role: ["ROLE_USER"],
        status: "open"
    };

    fs.readFile(users, 'utf8', (err, data) => {
        if (err) {
          console.error(err);
          res.status(500).send('Erreur lors de la lecture du fichier.');
          return;
        }
    
        // Analyser le contenu JSON du fichier
        const users = JSON.parse(data);
    
        // Ajouter le nouvel utilisateur
        users.push(user);
    
        // Convertir le tableau mis à jour en chaîne JSON
        const usersJSON = JSON.stringify(users);
    
        // Réécrire le fichier users.json avec les données mises à jour
        fs.writeFile(users, usersJSON, (err) => {
          if (err) {
            console.error(err);
            res.status(500).send('Erreur lors de l\'enregistrement de l\'utilisateur.');
          } else {
            console.log('Utilisateur ajouté avec succès !');
            res.status(200).send('Utilisateur ajouté avec succès.');
          }
        });
      });

    // Convert object user to JSON
    // const userJSON = JSON.stringify(user);

    // Écrire dans le fichier users.json
    // fs.writeFile(users, userJSON, (err) => {
    //     if (err) {
    //         console.error(err);
    //         res.status(500).send('Erreur lors de l\'enregistrement de l\'utilisateur.');
    //     } else {
    //         res.status(201).json({ message: 'Création avec succès de l\'utilisateur' });
    //     }
    // });

});


// Endpoint Access Token creation
/*
    "login": "string",
    "password": "string",
    "from": "string"

    Access token : valide 60 minutes
    Refresh token : valide 120 minutes

    Si plus de 3 échecs en 5min, pas de nouvelle tentative pendant 30 minutes
    Blocage basé sur l'IP du User

    Renvoi un Access Token et un Refresh Token
*/
app.post('/api/token', (req, res) => {

    const login     = req.body.login;
    const password  = req.body.password;

    // Verify authentification informations
    const user = users.find(u => u.login === login && u.password === password);

    if (user) {
        // Create AccessToken (JWT) and refreshToken and return it
        const accessToken   = jwt.sign({ username: user.username, id: user.id }, secretKey, { expiresIn: accessTokenExpiration });
        const refreshToken  = jwt.sign({ username: user.username, id: user.id }, secretKey, { expiresIn: refreshTokenExpiration });

        // Stocker le refresh token dans un fichier
        // fs.writeFile(`./refresh_tokens/${user.id}.json`, JSON.stringify({ refreshToken }));

        const currentDate           = new Date();
        const accessTokenExpiresAt  = new Date(currentDate.getTime() + accessTokenExpiration * 1000);
        const refreshTokenExpiresAt = new Date(currentDate.getTime() + refreshTokenExpiration * 1000);

        res.json({
            accessToken,
            accessTokenExpiresAt,
            refreshToken,
            refreshTokenExpiresAt,
        });

    } else {
        res.status(404).json({ message: 'Identifiants non trouvés (paire login / mot de passe inconnue)' });
    }

});

// Start the server
app.listen(port, () => {
    console.log(`Le serveur écoute sur le port ${port}`);
});
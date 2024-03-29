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


// MAJ pour le rendu du 19 janvier 2024
//
// ✅ Créer un compte utilisateur (soit par un admin, soit par un utilisateur non identifié)
// ⬛ Afficher / Editer un compte utilisateur
// ✅ Permet de créer un jeton utilisable par d’autres services par la suite
// ⬛ Permet de renouveler régulièrement ce jeton sans avoir à refaire toute la procédure
// ✅ Est protégée du brut force


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

    // Create a User object
    const user = {
        login: req.body.login,
        password: req.body.password,
        role: ["ROLE_USER"],
        status: "open"
    };

    if (user.login === '' ||
        user.login === undefined ||
        user.password === '' ||
        user.password === undefined
    ) {
        res.status(500).send('Un identifiant et un mot de passe sont nécessaires.');
        return
    }

    if (users.find(u => u.login === user.login)) {
        res.status(500).send('Erreur lors de l\'enregistrement de l\'utilisateur.');
        return
    }

    // users is a copy of the real users.json file, so we push the new user into users, then we create the users.json file and erase the old one
    users.push(user)

    fs.writeFile('./users.json', JSON.stringify(users), (err) => {
        if (err) throw err;
    })

    res.status(201).json({ message: 'Création avec succès de l\'utilisateur' });

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
// Dans le body, envoyer une requête comme suit :
//
// [
//     {
//         "login": "userAdmin",
//         "password": "modepasse1"
//     }
// ]
app.post('/api/token', (req, res) => {

    const login     = req.body.login;
    const password  = req.body.password;

    let tryCount = 0;
    let isBanned = false;

    // Verify authentification informations
    const user = users.find(u => u.login === login && u.password === password);

    if (!user) {
        tryCount++;
    }

    // If too many try, ban the User temporarly
    if (tryCount >= 3 || isBanned === true) {
        isBanned = true;

        // let date =  new Date();
        // let dateUntilRestrictedAccess = new Date(date.getTime() + '30 minutes');

        res.status(422).json({ message: 'Trop de tentatives, accès bloqué pour les 30 prochaines minutes.' });
    }

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


app.get('/api/validate/:accessToken', (req, res) => {

    const accessToken = req.params.accessToken;

    const verifiedAccessToken = jwt.verify(accessToken, secretKey);

    // Expiration date
    const timestamp = verifiedAccessToken.exp;
    const dateExpiration = new Date(timestamp * 1000);

    if (jwt.verify(accessToken, secretKey)) {
        // 200 : Renvoi AccessToken d'un User
        res.status(200).json({ accessToken: verifiedAccessToken.iat, accessTokenExpiresAt: dateExpiration });
        return
    }

    // 404 : Token non trouvé / non valide
    res.status(404).json({ message: 'Token non trouvé / invalide' });
});


// Start the server
app.listen(port, () => {
    console.log(`Le serveur écoute sur le port ${port}`);
});
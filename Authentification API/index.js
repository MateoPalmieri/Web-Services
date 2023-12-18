const express = require('express');
var app = express();
const port = 3000;
const jwt = require('jsonwebtoken');

const bodyParser = require('body-parser');
const fs = require('fs/promises');

const secretKey = 'secretKey';
const accessTokenExpiration = 30 * 60;
const refreshTokenExpiration = 120 * 60;


const users = [
    { id: 1, login: 'userAdmin', password: 'motdepasse1', role: ['ROLE_ADMIN', 'ROLE_USER'], status: 'open' },
    { id: 2, login: 'userLambda', password: 'motdepasse2', role: ['ROLE_USER'], status: 'closed' },
];


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
    
    // 201 Création avec succès


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

    console.log(req.body);
    
    const { login, password, from } = req.body;

    // Verify authentification informations
    const user = users.find(u => u.login === login && u.password === password && u.ipAddress === from);

    if (user) {
        // Create AccessToken (JWT) and refreshToken and return it
        const accessToken   = jwt.sign({ username: user.username, id: user.id }, secretKey, { expiresIn: accessTokenExpiration });
        const refreshToken  = jwt.sign({ username: user.username, id: user.id }, secretKey, { expiresIn: refreshTokenExpiration });

        // Stocker le refresh token dans un fichier
        fs.writeFile(`./refresh_tokens/${user.id}.json`, JSON.stringify({ refreshToken }));

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
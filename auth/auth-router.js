const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Models and Secrets go here
const Users = require('../users/user-model');
const secrets = require('../config/secrets');

// Below endpoints begin with /api/auth
router.post('/register', (req, res) => {
    let user = req.body;
    const hash = bcrypt.hashSync(user.password, 10);
    user.password = hash; // Scrambles password from scammers

    Users.add(user)
        .then(newAcct => res.status(201).json(newAcct))
        .catch(err => res.status(500).json(err))
});

router.post('/login', (req, res) => {
    let { username, password } = req.body;

    Users.findBy({ username })
    .first()
    .then(user => {
        if (user && bcrypt.compareSync(password, user.password)) {
            // Produce a token
            const token = generateToken(user);
            // Add token to response
            res.status(200).json({ 
                message: `How goes it, ${user.username}? Here is your `, token
            })
        } else {
            res.status(401).json({ message: `Nope, wrong credentials.`})
        }
    })
    .catch(err => res.status(500).json(err))
});

function generateToken(user) {
    const payload = {
        user: user.username,
        subject: user.id,
        department: user.department
    };

    const options = { 
        expiresIn: '1d'
    };

    return jwt.sign(payload, secrets.jwtSecret, options);
}

module.exports = router;
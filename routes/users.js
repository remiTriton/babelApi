const express = require('express');
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const router = express.Router();
const uri = process.env.MONGODB_URI
const client = new MongoClient(uri, { 
   useNewUrlParser: true,
  useUnifiedTopology: true,
});
const database = client.db('Babel');
const userCol = database.collection('users');

router.get('/', verifyToken, async (req, res) => {
    jwt.verify(req.token, 'token', async (err, authData) => {
        if (authData.user.role != 'Admin') {
            res.status(403).send('Accès interdit')
        } else {
            try {
                await client.connect();
                const users = await userCol.find().toArray();
                res.send(users);
            } finally {
                await client.close();
            }
        }
    })
});

router.get('/:id', verifyToken, async (req, res) => {
    jwt.verify(req.token, 'token', async (err, authData) => {
        if (authData.user.role != 'Admin') {
            res.status(403).send('Accès interdit')
        }
        else {
            try {
                await client.connect();
                const query = { _id: new ObjectId(req.params.id) };
                const users = await userCol.findOne(query);
                res.send(users);
            } finally {
                await client.close();
            }
        }
    })
});

router.post('/', async (req, res) => {
    try {
        await client.connect();
        // create a document to insert
        const doc = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            role: "Serveur",
        }
        if (!doc.firstName || !doc.lastName || !doc.email || !doc.password || !doc.role) {
            res.send('Please fill all fields')
        } else {
            const query = { email: doc.email };
            const user = await userCol.findOne(query);
            if (user) {
                res.status(500);
                res.send('existing email');
                return;
            }
            const hash = await new Promise((resolve, reject) => {
                bcrypt.genSalt(10, (err, salt) => bcrypt.hash(doc.password, salt, (err, hash) => {
                    if (err) {
                        reject(err)
                        return;
                    }
                    resolve(hash)
                    return;
                }))
            })
            //MDP securise
            doc.password = hash;
            console.log(doc)
            const result = await userCol.insertOne(doc);
            res.send(JSON.stringify({
                id: result
            }));
        }
    } finally {
        await client.close();
    }
});


//Login handler for

router.post('/login', async (req, res) => {
    await client.connect();
    const { email, password } = req.body
    // Match user
    userCol.findOne({
        email: email
    }).then(user => {
        if (!user) {
            return res.status(404).json('No user found')
        }
        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                jwt.sign({
                    user: {
                        id: user._id,
                        email: user.email,
                        role: user.role,
                    }, iat: Math.floor(Date.now() / 1000) + (60 * 60),
                }, 'token', (err, token) => {
                    res.status(200).json({
                        user: user, token: token
                    });
                });
            } else {
                return res.status(404).json('Wrong password')
            }
        })
    })
})

router.put("/:id", verifyToken, async (req, res) => {
    jwt.verify(req.token, 'token', async (err, authData) => {
        if (authData.user.role != 'Admin') {
            res.status(403).send('Accès interdit')
        } else {
            try {
                await client.connect();
                await userCol.updateOne(
                    { _id: new ObjectId(req.params.id) },
                    {
                        $set:
                            req.body
                    }
                );
                res.send("User updated");
            } finally {
                await client.close();
            }
        }})
});

router.delete("/:id", verifyToken, async (req, res) => {
    jwt.verify(req.token, 'token', async (err, authData) => {
        if (authData.user.role != 'Admin') {
            res.status(403).send('Accès interdit')
        } else {
            try {
                await client.connect();
                const query = { _id: new ObjectId(req.params.id) };
                await userCol.deleteOne(query);
                res.send("Successfully deleted!");
            } finally {
                await client.close();
            }
        }
    })
});
//Vue profil


router.post('/profile', verifyToken, async (req, res) => {
    jwt.verify(req.token, 'token', async (err, authData) => {
        try {
            await client.connect();
            const query = { _id: new ObjectId(authData.user.id) };
            const users = await userCol.findOne(query);
            console.log(users)
            res.send(authData);
        } finally {
            await client.close();
        }
    })

});


//On verifie tokenn
function verifyToken(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if (typeof bearerHeader !== 'undefined') {
        // Split at the space
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        // Next middleware
        next();
    } else {
        // Forbidden
        res.sendStatus(403);
    }
}

module.exports = {
    router: router,
    verifyToken: verifyToken
};


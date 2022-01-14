const express = require("express");
require('dotenv').config();

const { MongoClient, ObjectId } = require("mongodb");
const router = express.Router();
const uri = process.env.MONGODB_URI
const client = new MongoClient(uri, { 
   useNewUrlParser: true,
  useUnifiedTopology: true,
});
const database = client.db("Babel");
const orderCol = database.collection("orders");
const wineCol = database.collection('wines');
const users = require('./users')
const jwt = require('jsonwebtoken');


router.get("/", users.verifyToken, async (req, res) => {
    jwt.verify(req.token, 'token', async (err, authData) => {
        if (authData.user.role === 'Serveur') {
            res.status(403).json("Access Forbidden");
        }
        try {
            await client.connect();
            const orders = await orderCol.find().toArray();
            res.send(orders);
        } finally {
            await client.close();
        }
    })
});

router.post("/", users.verifyToken, async (req, res) => {
    jwt.verify(req.token, 'token', async (err, authData) => {
        if (authData.user.role === 'Serveur') {
            res.status(403).json("Access Forbidden");
        }
        try {
            await client.connect();
            if (req.body.id) {
                const id = req.body.id;
                const product = await wineCol.findOne(new ObjectId(id));
                // create a document to insert
                const doc = {
                    
                    userEmail: req.body.email,
                    status: 'Waiting',
                    wines:
                        [{
                            id: product._id,
                            cuvee: product.cuvee,
                            quantite: req.body.quantite,
                        }],
                };
                const result = await orderCol.insertOne(doc);
                res.send(result);
            } else {
                const doc = {
                    Created: Date(),
                    userEmail: req.body.email,
                };
                const result = await orderCol.insertOne(doc);
                const newOrder = await orderCol.findOne({ _id: new ObjectId(result.insertedId) });
                res.send(newOrder);
            }

        } finally {
            await client.close();
        }
    })
});

router.get("/:id", users.verifyToken, async (req, res) => {
    jwt.verify(req.token, 'token', async (err, authData) => {
        if (authData.user.role === 'Serveur') {
            res.status(403).json("Access Forbidden");
        }
        try {
            await client.connect();
            const query = { _id: new ObjectId(req.params.id) };
            const order = await orderCol.findOne(query);
            res.send(order);
        } finally {
            await client.close();
        }
    })
});

// GET / PUT / POST / DELETE
router.put("/:id", users.verifyToken, async (req, res) => {
    jwt.verify(req.token, 'token', async (err, authData) => {
        if (authData.user.role === 'Serveur') {
            res.status(403).json("Access Forbidden");
        }
        try {
            await client.connect();
            const id = req.body.id;
            const product = await wineCol.findOne(new ObjectId(id));
            await orderCol.updateOne(
                { _id: new ObjectId(req.params.id) },
                {
                    $set: { status: req.body.status },
                    $push: {
                        wines:
                        {
                            wineId: product._id,
                            cuvee: product.cuvee,
                            couleur: product.couleur,
                            quantite: req.body.quantite,
                        }
                    }
                }
            );
            const order = await orderCol.findOne((new ObjectId(req.params.id)));

            res.send(order);
        } finally {
            await client.close();
        }
    })
});


router.put("/validate/:id", users.verifyToken, async (req, res) => {
    jwt.verify(req.token, 'token', async (err, authData) => {
        if (authData.user.role === 'Serveur') {
            res.status(403).json("Access Forbidden");
        }
        try {
            await client.connect();
            await orderCol.updateOne(
                { _id: new ObjectId(req.params.id) },
                {
                    $set: { status: req.body.status }
                }
            );
            res.send("Order updated");
        } finally {
            await client.close();
        }
    })
});


router.put("/confirm/:id", users.verifyToken, async (req, res) => {
    jwt.verify(req.token, 'token', async (err, authData) => {
        if (authData.user.role === 'Serveur') {
            res.status(403).json("Access Forbidden");
        }
        try {
            await client.connect();
            const result = await orderCol.updateOne(
                { _id: new ObjectId(req.params.id), "wines.cuvee": req.body.cuvee, "wines.couleur": req.body.couleur },
                {
                    $set: { "wines.$.quantite": req.body.quantite }
                }
            );
            res.send(result);
        } finally {
            await client.close();
        }
    })
});

router.delete("/:id", users.verifyToken, async (req, res) => {
    jwt.verify(req.token, 'token', async (err, authData) => {
        if(authData.user.role === 'Serveur') {
            res.status(403).json("Access Forbidden");
        }
        try {
            await client.connect();
            const query = { _id: new ObjectId(req.params.id) };
            await orderCol.deleteOne(query);
            res.send("Successfully deleted!");
        } finally {
            await client.close();
        }
    })
});

router.get("/wine/:id", users.verifyToken, async (req, res) => {
    jwt.verify(req.token, 'token', async (err, authData) => {
        if (authData.user.role === 'Serveur') {
            res.status(403).json("Access Forbidden");
        }
        try {
            await client.connect();
            const order = await orderCol.find({
                _id: new ObjectId(req.params.id),
                wines: {
                    $elemMatch: {
                        cuvee: req.body.cuvee,
                    }
                }
            }).toArray();
            res.send(order);
        } finally {
            await client.close();
        }
    })
});

router.put("/deleteOneWine/:id", users.verifyToken, async (req, res) => {
    jwt.verify(req.token, 'token', async (err, authData) => {
        if (authData.user.role === 'Serveur') {
            res.status(403).json("Access Forbidden");
        }
        try {
            await client.connect();
            const order = await orderCol.updateOne({

                _id: new ObjectId(req.params.id)
            },
                { $pull: { wines: { wineId: ObjectId(req.body.wineId) } } },
                { multi: true }
            );
            res.send(order)
        } finally {
            await client.close();
        }
    })
});

//function 


module.exports = router;

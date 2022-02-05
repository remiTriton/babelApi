const express = require("express");
require('dotenv').config();
const { MongoClient, ObjectId } = require("mongodb");
const router = express.Router();
const uri = process.env.MONGODB_URI
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const database = client.db("babel");
const alcCol = database.collection("alcools");
const users = require('./users')
const jwt = require('jsonwebtoken');

const alcoolFields = {
    cuvee:1,
    centilitrage:1,
    producteur:1,
    quantite:1,
    prix:1,
    type:1
  }
  
  
  router.post("/", users.verifyToken, async (req, res) => {
    jwt.verify(req.token, 'token', async (err, authData) => {
      if (authData.user.role === 'Serveur') {
        res.status(403).json("Access Forbidden");
        return;
      } else {
        try {
          await client.connect();
          // create a document to insert
          const doc = {
            cuvee: req.body.cuvee,
            producteur:req.body.producteur,
            centilitrage:req.body.centilitrage,
            type:req.body.type,
            imgBase64: req.body.imgBase64,
            prix:req.body.prix,
            quantite:req.body.quantite
  
          };
          const result = await alcCol.insertOne(doc);
          res.send(`A document was inserted with the _id: ${result.insertedId}`);
        } finally {
          await client.close();
        }
      }
    })
  });


  router.get("/all/:skip/:limit", async (req, res) => {
    try {
      await client.connect();
      const skip = parseInt(req.params.skip);
      const limit = parseInt(req.params.limit);
      const pages = await alcCol
        .countDocuments() / 24;
      const alcools = await alcCol
        .find({})
        .project(alcoolFields)
        .skip(skip)
        .limit(limit)
        .toArray();
  
      res.send({ alcools, pages });
    } finally {
      await client.close();
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      await client.connect();
      const query = { _id: new ObjectId(req.params.id) };
      const alcool = await alcCol.findOne(query);
      res.send(alcool);
    } finally {
      await client.close();
    }
  });

  router.get('/:id/image', async (req, res) => {
    try {
      await client.connect();
      const query = { _id: new ObjectId(req.params.id) };
  
      let projection = Object.keys(alcoolFields).reduce((acc, v) => {
        acc[v] = v === 'imgBase64' ? 1 : 0
        return acc;
      }, {})
  
      const alcool = await alcCol.findOne(query, { projection });
  
      if (wine.imgBase64) {
        const img = Buffer.from(alcool.imgBase64.replace(/^data:image\/png;base64,/, ''), 'base64');
        res.writeHead(200, {
          'Content-Type': 'image/png',
          'Content-Length': img.length
        });
        res.end(img);
      } else {
        res.end('no img')
      }
    } finally {
      await client.close();
    }
  })

  router.delete("/:id", users.verifyToken, async (req, res) => {
    jwt.verify(req.token, 'token', async (err, authData) => {
      if (authData.user.role === 'Serveur') {
        res.status(403).json("Access Forbidden");
      }
      try {
        await client.connect();
        const query = { _id: new ObjectId(req.params.id) };
        await alcCol.deleteOne(query);
        res.send("Successfully deleted!");
      } finally {
        await client.close();
      }
    })
  });

  
router.put("/:id", users.verifyToken, async (req, res) => {
  jwt.verify(req.token, 'token', async (err, authData) => {
    if (authData.user.role === 'Serveur') {
      res.status(403).json("Access Forbidden");
      return;
    } else {

      try {
        await client.connect();
        await alcCol.updateOne(
          { _id: new ObjectId(req.params.id) },
          {
            $set:
              req.body
          }
        );
        res.send("Alcool updated");
      } finally {
        await client.close();
      }
    }
  })
});

router.get("/:type/:skip/:limit", async (req, res) => {
  try {
    await client.connect();
    const query = { type: { $regex: new RegExp(req.params.type, "i") } };
    const skip = parseInt(req.params.skip);
    const limit = parseInt(req.params.limit);
    const pagination = await alcCol
      .countDocuments(query) / 24;
    const alcool = await alcCol.find(query)
      .project(alcoolFields)
      .skip(skip)
      .limit(limit)
      .toArray();
    res.send({ alcool, pagination });
  } finally {
    await client.close();
  }
});
router.get("/search/:cuvee/:skip/:limit", async (req, res) => {
  try {
    await client.connect();
    const query = { cuvee: { $regex: new RegExp(req.params.cuvee, "i") } }
    const skip = parseInt(req.params.skip);
    const limit = parseInt(req.params.limit);
    const pagination = await alcCol
      .countDocuments(query) / 24;
    const alcool = await alcCol
      .find(query)
      .project(alcoolFields)
      .skip(skip)
      .limit(limit)
      .toArray();
    res.send({ alcool, pagination });
  } finally {
    await client.close();
  }
});

  module.exports = router;

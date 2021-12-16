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
const wineCol = database.collection("wines");
const users = require('./users')
const jwt = require('jsonwebtoken');

router.get("/", async (req, res) => {
  try {
    await client.connect();
    const wines = await wineCol.find().sort({ cuvee: 1 }).toArray();
    res.send(wines);
  } finally {
    await client.close();
  }
});

router.get("/:id", async (req, res) => {
  try {
    await client.connect();
    const query = { _id: new ObjectId(req.params.id) };
    const wine = await wineCol.findOne(query);
    res.send(wine);
  } finally {
    await client.close();
  }
});

router.get("/pagination/:skip/:limit", async (req, res) => {
  try {
    await client.connect();
    const skip = parseInt(req.params.skip);
    const limit = parseInt(req.params.limit);
    const wines = await wineCol.find().sort({ cuvee: 1 }).skip(skip).limit(limit).toArray();
    res.send(wines)
  } finally {
    await client.close();
  }
})

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
          domaine: req.body.domaine,
          cepage: req.body.cepage,
          millesime: req.body.millesime,
          vigneron: req.body.vigneron,
          couleur: req.body.couleur,
          description: req.body.description,
          region: req.body.region,
          pays: req.body.pays,
          quantite: req.body.quantite,
          prix: req.body.prix,
          departement: req.body.departement,
          imgBase64: req.body.imgBase64
        };
        const result = await wineCol.insertOne(doc);
        res.send(`A document was inserted with the _id: ${result.insertedId}`);
      } finally {
        await client.close();
      }
    }
  })
});

router.get("/search/:cuvee", async (req, res) => {
  try {
    await client.connect();
    const q = req.params.cuvee
    const wine = await wineCol.find({ cuvee: { $regex: new RegExp(q, "i") } }).sort({ cuvee: 1 }).toArray();
    res.send(wine);
  } finally {
    await client.close();
  }
});

router.get("/domain/:domaine", async (req, res) => {
  try {
    await client.connect();
    const q = req.params.domaine
    const wine = await wineCol.find({ domaine: { $regex: new RegExp(q, "i") } }).sort({ cuvee: 1 }).toArray();
    res.send(wine);
  } finally {
    await client.close();
  }
});

router.get("/color/:couleur", async (req, res) => {
  try {
    await client.connect();
    if (req.params.couleur === "Magnum") {
      const query = { type: req.params.couleur };
      const wine = await wineCol.find(query).sort({ cuvee: 1 }).toArray();
      res.send(wine);

    } else {
      const query = { couleur: req.params.couleur };
      const wine = await wineCol.find(query).sort({ cuvee: 1 }).toArray();
      res.send(wine);
    }
  } finally {
    await client.close();
  }
});

router.get("/cepage/:cepage", async (req, res) => {
  try {
    await client.connect();
    const query = { cepage: req.params.cepage };
    const wine = await wineCol.find(query).sort({ cuvee: 1 }).toArray();
    res.send(wine);
  } finally {
    await client.close();
  }
});

router.get("/region/:region", async (req, res) => {
  try {
    await client.connect();
    const q = req.params.region
    const query = { region: { $regex: new RegExp(q, "i") } };
    const wine = await wineCol.find(query).sort({ cuvee: 1 }).toArray();
    res.send(wine);
  } finally {
    await client.close();
  }
});
router.get("/pays/:pays", async (req, res) => {
  try {
    await client.connect();
    const q = req.params.pays
    const query = { pays: { $regex: new RegExp(q, "i") } };
    const wine = await wineCol.find(query).sort({ cuvee: 1 }).toArray();
    res.send(wine);
  } finally {
    await client.close();
  }
});

router.put("/:id", users.verifyToken, async (req, res) => {
  jwt.verify(req.token, 'token', async (err, authData) => {
    if (authData.user.role === 'Serveur') {
      res.status(403).json("Access Forbidden");
      return;
    } else {

      try {
        await client.connect();
        await wineCol.updateOne(
          { _id: new ObjectId(req.params.id) },
          {
            $set:
              req.body
          }
        );
        res.send("Wine updated");
      } finally {
        await client.close();
      }
    }
  })
});

router.delete("/:id", users.verifyToken, async (req, res) => {
  jwt.verify(req.token, 'token', async (err, authData) => {
    if (authData.user.role === 'Serveur') {
      res.status(403).json("Access Forbidden");
    }
    try {
      await client.connect();
      const query = { _id: new ObjectId(req.params.id) };
      await wineCol.deleteOne(query);
      res.send("Successfully deleted!");
    } finally {
      await client.close();
    }
  })
});
router.post("/price/lowerthan/", async (req, res) => {

      try {
        await client.connect();
        const wines = await wineCol.find({ prix: { $lt: Number(req.body.prix) } }).sort({ cuvee: 1 }).toArray();
        res.send(wines);
      } finally {
        await client.close();
      }
    });

router.get("/kpi/sum", async (req, res) => {
  try {
    await client.connect();

    const totalBycolor = await wineCol.aggregate([{
      "$group": {
        "_id": "$couleur",
        "prices": {
          "$sum": {
            "$multiply": ["$prix", "$quantite"]
          }

        },
        "quantite": {
          "$sum": "$quantite",
        }
      },
    },
    ]).toArray();
    const total = await wineCol.aggregate([{
      "$group": {
        "_id": "null",
        "prices": {
          "$sum": {
            "$multiply": ["$prix", "$quantite"]
          }

        },
        "quantite": {
          "$sum": "$quantite",
        }
      },
    },
    ]).toArray();
    res.send([totalBycolor, total])
  } finally {
    await client.close();
  }
});



module.exports = router;

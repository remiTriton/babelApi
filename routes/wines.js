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
const wineCol = database.collection("wines");
const users = require('./users')
const jwt = require('jsonwebtoken');



const wineFields = {
  couleur: 1,
  cuvee: 1,
  domaine: 1,
  departement: 1,
  region: 1,
  pays: 1,
  millesime: 1,
  cepage: 1,
  vigneron: 1,
  prix: 1,
  quantite: 1,
  description: 1,
}

router.get("/all/:skip/:limit", async (req, res) => {
  try {
    await client.connect();
    const skip = parseInt(req.params.skip);
    const limit = parseInt(req.params.limit);
    const pages = await wineCol
      .countDocuments() / 24;
    const wines = await wineCol
      .find({})
      .project(wineFields)
      .skip(skip)
      .limit(limit)
      .toArray();

    res.send({ wines, pages });
  } finally {
    await client.close();
  }
});

router.get('/:id/image', async (req, res) => {
  try {
    await client.connect();
    const query = { _id: new ObjectId(req.params.id) };

    let projection = Object.keys(wineFields).reduce((acc, v) => {
      acc[v] = v === 'imgBase64' ? 1 : 0
      return acc;
    }, {})

    const wine = await wineCol.findOne(query, { projection });

    if (wine.imgBase64) {
      const img = Buffer.from(wine.imgBase64.replace(/^data:image\/png;base64,/, ''), 'base64');
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

router.get("/search/:cuvee/:skip/:limit", async (req, res) => {
  try {
    await client.connect();
    const query = { cuvee: { $regex: new RegExp(req.params.cuvee, "i") } }
    const skip = parseInt(req.params.skip);
    const limit = parseInt(req.params.limit);
    const pagination = await wineCol
      .countDocuments(query) / 24;
    const wine = await wineCol
      .find(query)
      .project(wineFields)
      .skip(skip)
      .limit(limit)
      .toArray();
    res.send({ wine, pagination });
  } finally {
    await client.close();
  }
});

router.get("/domain/:domaine/:skip/:limit", async (req, res) => {
  try {
    await client.connect();
    const query = { domaine: { $regex: new RegExp(req.params.domaine, "i") } }
    const skip = parseInt(req.params.skip);
    const limit = parseInt(req.params.limit);
    const pagination = await wineCol
      .countDocuments(query) / 24;
    const wine = await wineCol.find(query)
      .project(wineFields)
      .skip(skip)
      .limit(limit)
      .toArray();
    res.send({ wine, pagination });
  } finally {
    await client.close();
  }
});

router.get("/color/:couleur/:skip/:limit", async (req, res) => {
  try {
    await client.connect();
    if (req.params.couleur === "Magnum") {
      const skip = parseInt(req.params.skip);
      const limit = parseInt(req.params.limit);
      const query = { type: req.params.couleur };
      const pagination = await wineCol
        .countDocuments(query) / 24;
      const wine = await wineCol.find(query)
        .project(wineFields)
        .skip(skip)
        .limit(limit)
        .toArray();
      res.send({ wine, pagination });

    } else {
      const skip = parseInt(req.params.skip);
      const limit = parseInt(req.params.limit);
      const query = { couleur: req.params.couleur };
      const pagination = await wineCol
        .countDocuments(query) / 24;
      const wine = await wineCol.find(query)
        .project(wineFields)
        .skip(skip)
        .limit(limit)
        .toArray();
      res.send({ wine, pagination })
    }
  } finally {
    await client.close();
  }
});

router.get("/cepage/:cepage/:skip/:limit", async (req, res) => {
  try {
    await client.connect();
    const query = { cepage: { $regex: new RegExp(req.params.cepage, "i") } };
    const skip = parseInt(req.params.skip);
    const limit = parseInt(req.params.limit);
    const pagination = await wineCol
      .countDocuments(query) / 24;
    const wine = await wineCol.find(query)
      .project(wineFields)
      .skip(skip)
      .limit(limit)
      .toArray();
    res.send({ wine, pagination });
  } finally {
    await client.close();
  }
});

router.get("/region/:region/:skip/:limit", async (req, res) => {
  try {
    await client.connect();
    const q = req.params.region
    const query = { region: { $regex: new RegExp(q, "i") } };
    const skip = parseInt(req.params.skip);
    const limit = parseInt(req.params.limit);
    const pagination = await wineCol
      .countDocuments(query) / 24;
    const wine = await wineCol.find(query)
      .project(wineFields)
      .skip(skip)
      .limit(limit)
      .toArray();
    res.send({ wine, pagination });
  } finally {
    await client.close();
  }
});

router.get("/pays/:pays/:skip/:limit", async (req, res) => {
  try {
    await client.connect();
    const q = req.params.pays
    const query = { pays: { $regex: new RegExp(q, "i") } };
    const skip = parseInt(req.params.skip);
    const limit = parseInt(req.params.limit);
    const pagination = await wineCol
      .countDocuments(query) / 24;
    const wine = await wineCol.find(query)
      .project(wineFields)
      .skip(skip)
      .limit(limit)
      .toArray();
    res.send({ wine, pagination });
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

router.post("/price/lowerthan/:skip/:limit", async (req, res) => {
  try {
    await client.connect();
    const query = { prix: { $lt: Number(req.body.prix) } }
    const skip = parseInt(req.params.skip);
    const limit = parseInt(req.params.limit);
    const pagination = await wineCol
      .countDocuments(query) / 24;
    const wines = await wineCol.find(query)
      .sort({ prix: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    res.send({ wines, pagination });
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


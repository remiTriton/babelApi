const jwt = require('jsonwebtoken');
const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const router = express.Router();
const uri = process.env.MONGODB_URI
const client = new MongoClient(uri, { 
   useNewUrlParser: true,
  useUnifiedTopology: true,
});
const database = client.db("Babel");
const userCol = database.collection("users");
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcryptjs')
const users = require('./users')
const tokenPass = database.collection("tokensPass")

router.post("/", async (req, res) => {
    try {
        await client.connect();
        const user = await userCol.findOne({ email: req.body.email });
        if (!user)
            return res.status(400).send("This mail doesn't exists.");

        let bearerHeader = req.headers['authorization'];
        // Check if bearer is undefined
        if (typeof bearerHeader !== 'undefined') {
            // Split at the space
            const bearer = bearerHeader.split(' ');
            // Get token from array
            const bearerToken = bearer[1];
            // Set the token
            req.token = bearerToken;
            // Next middleware
        } else {
            jwt.sign({
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                }, iat: Math.floor(Date.now() / 1000) + (60 * 60), expiresIn: 60 * 60 
            }, 'token', (err, token) => {
                res.status(200).json({
                    user: user, token: token
                });

            });
        }
        const tok = await tokenPass.insertOne({ 
            iat: Math.floor(Date.now() / 1000) + (60 * 60), expiresIn: 60 * 60
        });
        const tak = await tokenPass.findOne({_id: new ObjectId(tok.insertedId)})

        console.log(tak)

        const link = `${process.env.LINK_MAIL}${user._id}/${tak._id}`;
        await sendEmail(user.email, "Password reset", "Bonjour, il semblerait que vous ayiez demandé une demande de nouveau mot de passe, Veuillez vous rendre à cette adresse :" + link );

    } catch (error) {
        console.log(error)
    } finally {
        await client.close();
    }
});

router.post('/:userId/:tokenId', users.verifyToken, async (req, res) => {
    try {
        await client.connect();
        const user = await userCol.findOne({ _id: new ObjectId(req.params.userId) });
        const token = await tokenPass.findOne({_id:new ObjectId(req.params.tokenId)});
        if (!user || !token)
            return res.status(400).send('invalid link or expired');

        const hash = await new Promise((resolve, reject) => {
            bcrypt.genSalt(10, (err, salt) => bcrypt.hash(req.body.password, salt, (err, hash) => {
                if (err) {
                    reject(err)
                    return;
                }
                resolve(hash)
                return;
            }))
        })
        await userCol.updateOne({ _id: new ObjectId(req.params.userId) },
            {
                $set: {
                    password: hash
                }
            });
            await tokenPass.deleteOne({ _id: new ObjectId(req.params.tokenId)})
        console.log(hash)
        res.status(200).send('password updatedt LUL')
    } finally {
        await client.close();
    }
});

module.exports = router;

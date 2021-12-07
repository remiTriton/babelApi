const {MongoClient} = require("mongodb");
const bcrypt = require('bcryptjs')
const fs = require('fs').promises;
require('dotenv').config();

// convert users.csv file to JSON array
const main = async () => {
  const uri = process.env.MONGODB_URI
  const client = new MongoClient(uri, { 
     useNewUrlParser: true,
    useUnifiedTopology: true,
  });

    await client.connect();
    const database = client.db('Babel');
    const wineCol = database.collection('wines');
    const user = database.collection('users');

  const password = await new Promise((resolve, reject) => {
    bcrypt.genSalt(10, (err, salt) => bcrypt.hash('admin', salt, (err, hash) => {
      if (err) {
        reject(err)
        return;
      }
      resolve(hash)
      return;
    }))
  })

    user.insertOne({
      firstName: 'admin',
      lastName: 'admin',
      email: 'admin@admin',
      password,
      role: "Admin",
    })


    const fileContent = await fs.readFile('./populate_db/data.csv');

    const fileContentStr = String(fileContent);

    const data = fileContentStr
        // each wine is on a new line
        .split('\n')

        // remove blank line
        .filter((line) => !!line.trim())


        // map string split by `;` to document
        .map((line, i) => {
            // escape first line
            if (!i) {
                return null;
            }
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
            const [couleur, cuvee, domaine, region, pays, millesime, cepage, vigneron, prix, quantite] = line.split(';')
            return {
                couleur,
                domaine,
                cuvee,
                region,
                pays,
                millesime,
                cepage,
                vigneron,
                prix: Number(prix || 0),
                quantite: Number(quantite || 0)
            };
        })
        // remove NULL document (first line of the doc)
        .filter(Boolean);
    await wineCol.insertMany(data);
    console.log('done');
    process.exit(0);
}
main();


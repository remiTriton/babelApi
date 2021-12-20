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
    console.log(uri)
    await client.connect();
    const database = client.db('babel');
    const wineCol = database.collection('wines');
    // const user = database.collection('users');
    // const password = await new Promise((resolve, reject) => {
    //   bcrypt.genSalt(10, (err, salt) => bcrypt.hash('admin', salt, (err, hash) => {
    //     if (err) {
    //       reject(err)
    //       return;
    //     }
    //     resolve(hash)
    //     return;
    //   }))
    // })

    // user.insertOne({
    //   firstName: 'admin',
    //   lastName: 'admin',
    //   email: 'admin@admin',
    //   password,
    //   role: "Admin",
    // })


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
            //   const [couleur, cuvee, domaine, departement, region, pays, millesime, cepage, vigneron, prix, quantite, description, type] = line.split(';')
            //   return {
            //     couleur: String(couleur.charAt(0).toUpperCase() + couleur.slice(1).toLowerCase() || ''),
            //     domaine: String(domaine.charAt(0).toUpperCase() + domaine.slice(1).toLowerCase() || ''),
            //     departement: String(departement.charAt(0).toUpperCase() + departement.slice(1).toLowerCase() ||  ''),
            //     cuvee: String(cuvee.charAt(0).toUpperCase() + cuvee.slice(1).toLowerCase()) || '',
            //     region: String(region.charAt(0).toUpperCase() + region.slice(1).toLowerCase() || ''),
            //     pays: String(pays.charAt(0).toUpperCase() + pays.slice(1).toLowerCase()) || '',
            //     millesime: String(millesime.charAt(0).toUpperCase() + millesime.slice(1).toLowerCase() || ''),
            //     cepage: String(cepage.charAt(0).toUpperCase() + cepage.slice(1).toLowerCase()) ||  '',
            //     vigneron: String(vigneron.charAt(0).toUpperCase() + vigneron.slice(1).toLowerCase() ||  ''),
            //     prix: Number(prix ||  0),
            //     quantite: Number(quantite || 0),
            //     description,
            //     type
            //   };
            // })
            const [couleur, prix, cuvee, domaine, quantite, pays] = line.split(';')
            return {
                couleur: String(couleur.charAt(0).toUpperCase() + couleur.slice(1).toLowerCase() || ''),
                domaine: String(domaine.charAt(0).toUpperCase() + domaine.slice(1).toLowerCase() || ''),
                // departement: String(departement.charAt(0).toUpperCase() + departement.slice(1).toLowerCase() ||  ''),
                cuvee: String(cuvee.charAt(0).toUpperCase() + cuvee.slice(1).toLowerCase()) || '',
                // region: String(region.charAt(0).toUpperCase() + region.slice(1).toLowerCase() || ''),
                pays: String(pays.charAt(0).toUpperCase() + pays.slice(1).toLowerCase()) || '',
                // millesime: String(millesime.charAt(0).toUpperCase() + millesime.slice(1).toLowerCase() || ''),
                // cepage: String(cepage.charAt(0).toUpperCase() + cepage.slice(1).toLowerCase()) ||  '',
                // vigneron: String(vigneron.charAt(0).toUpperCase() + vigneron.slice(1).toLowerCase() ||  ''),
                prix: Number(prix || 0),
                quantite: Number(quantite || 0),
                // description,
                // type
            };
        })
        // remove NULL document (first line of the doc)
        .filter(Boolean);
    await wineCol.insertMany(data);
    console.log('done');
    process.exit(0);
}
main();


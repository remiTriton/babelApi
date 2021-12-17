
const uri = process.env.MONGODB_URI
const { MongoClient, ObjectId } = require("mongodb");



module.exports = async () => {
  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();
  const database = client.db("Babel");
  console.log(database)
};
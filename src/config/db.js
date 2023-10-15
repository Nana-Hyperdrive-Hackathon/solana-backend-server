const { MongoClient, ServerApiVersion } = require('mongodb')
// Replace the placeholder with your Atlas connection string
const uri = `mongodb+srv://${process.env.MONGOSV}:${process.env.MONGOPW}@${process.env.MONGOURI}`

console.log('url', uri)
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

module.exports = client

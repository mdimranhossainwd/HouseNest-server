const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.HOUSENEST_USERNAME}:${process.env.HOUSENEST_PASSWORD}@cluster0.2xcsswz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const advertisementCollections = client
      .db("housenestDB")
      .collection("advertisement");

    // CURD OPERATIONS
    app.get("/housenest/v1/advertisement", async (req, res) => {
      const cursor = await advertisementCollections.find().toArray();
      res.send(cursor);
    });

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("House-Property Running on 5000 ---->");
});

app.listen(port, () => {
  console.log(`House-Property Currently Running on :----> ${port}`);
});

// CDz3DDuUjZwTa3Vq
// housenestDB

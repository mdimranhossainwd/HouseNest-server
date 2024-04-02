const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

    const reviewCollections = client.db("housenestDB").collection("reviews");
    const userCollections = client.db("housenestDB").collection("users");
    const wishlistsCollections = client
      .db("housenestDB")
      .collection("wishlists");

    // CURD OPERATIONS
    app.get("/housenest/api/v1/advertisement", async (req, res) => {
      const cursor = await advertisementCollections.find().toArray();
      res.send(cursor);
    });

    app.get("/housenest/v1/advertisement/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await advertisementCollections.findOne(query);
      res.send(result);
    });

    app.post("/housenest/api/v1/reviews", async (req, res) => {
      const body = req.body;
      const result = await reviewCollections.insertOne(body);
      res.send(result);
    });

    app.post("/housenest/api/v1/wishlists", async (req, res) => {
      const body = req.body;
      const result = await wishlistsCollections.insertOne(body);
      res.send(result);
    });

    app.get("/housenest/api/v1/wishlists", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await wishlistsCollections.find(query).toArray();
      res.send(result);
    });

    app.get("/housenest/api/v1/wishlists/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await wishlistsCollections.findOne(query);
      res.send(result);
    });

    app.post("/housenest/api/v1/users", async (req, res) => {
      const body = req.body;
      const result = await userCollections.insertOne(body);
      res.send(result);
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

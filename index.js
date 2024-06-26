const express = require("express");
const app = express();
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const stripe = require("stripe")(process.env.HOUSENEST_STRIPE_SECRET_KEY);

const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "https://housenest-4791e.web.app",
      "https://housenest-4791e.firebaseapp.com",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

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
    const paymentCollections = client.db("housenestDB").collection("payments");
    const offerCollections = client.db("housenestDB").collection("offer");
    const UserReviewCollections = client.db("housenestDB").collection("review");
    const allPropertiesCollections = client
      .db("housenestDB")
      .collection("properties");
    const addPropertyCollections = client
      .db("housenestDB")
      .collection("addProperty");
    const roleUserCollections = client
      .db("housenestDB")
      .collection("roleusers");
    const wishlistsCollections = client
      .db("housenestDB")
      .collection("wishlists");

    const gateman = (req, res, next) => {
      const { token } = req.cookies;

      if (!token) {
        return res.status(401).send({ message: "Your are not Authorized" });
      }

      jwt.verify(
        token,
        process.env.RESTURANT_ACCESS_TOKEN,
        function (err, decoded) {
          if (err) {
            return res.status(401).send({ message: "Your are not Authorized" });
          }
          req.user = decoded;
          next();
        }
      );
    };

    app.post("/housenest/api/v1/auth/access-token", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.HOUSENEST_ACCESS_TOKEN, {
        expiresIn: "1h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ success: true });
    });

    app.post("/housenest/api/v1/create-payment-intent", async (req, res) => {
      const { price } = req.body;
      const numericPrice = parseFloat(price);
      const amount = parseInt(numericPrice * 100);
      console.log(amount, "amount inside the intent");
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    app.post("/housenest/api/v1/payment", async (req, res) => {
      const payment = req.body;
      const result = await paymentCollections.insertOne(payment);
      console.log("payment body", payment);

      const query = {
        _id: {
          $in: payment.singleId.map((id) => new ObjectId(id)),
        },
      };

      const deleteResult = await offerCollections.deleteMany(query);

      res.send({ result, deleteResult });
    });

    app.get("/housenest/api/v1/payment", async (req, res) => {
      const cursor = await paymentCollections.find().toArray();
      res.send(cursor);
    });

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

    app.get("/housenest/api/v1/reviews", async (req, res) => {
      const cursor = await reviewCollections.find().toArray();
      res.send(cursor);
    });

    app.delete("/housenest/api/v1/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollections.deleteOne(query);
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

    app.get("/housenest/api/v1/addproperty", async (req, res) => {
      const cursor = await addPropertyCollections.find().toArray();
      res.send(cursor);
    });

    app.get("/housenest/api/v1/wishlists/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const result = await wishlistsCollections.findOne(query);
      res.send(result);
    });

    app.get("/housenest/api/v1/roleusers/:email", async (req, res) => {
      const email = req.params.email;
      const cursor = await roleUserCollections.findOne({ email });
      res.send(cursor);
    });

    app.post("/housenest/api/v1/users", async (req, res) => {
      const body = req.body;
      const result = await userCollections.insertOne(body);
      res.send(result);
    });

    app.get("/housenest/api/v1/users", async (req, res) => {
      const result = await userCollections.find().toArray();
      res.send(result);
    });

    app.patch("/housenest/api/v1/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollections.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.patch("/housenest/api/v1/users/agent/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "agent",
        },
      };
      const result = await userCollections.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.patch("/housenest/api/v1/users/fraud/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "fraud",
        },
      };
      const result = await userCollections.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.post("/housenest/api/v1/offer", async (req, res) => {
      const body = req.body;
      const result = await offerCollections.insertOne(body);
      res.send(result);
    });

    app.get("/housenest/api/v1/offer", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = await offerCollections.find(query).toArray();
      res.send(cursor);
    });

    app.get("/housenest/api/v1/offer", async (req, res) => {
      const cursor = await offerCollections.find().toArray();
      res.send(cursor);
    });

    app.post("/housenest/api/v1/review", async (req, res) => {
      const body = req.body;
      const result = await UserReviewCollections.insertOne(body);
      res.send(result);
    });

    app.get("/housenest/api/v1/review", async (req, res) => {
      const cursor = await UserReviewCollections.find().toArray();
      res.send(cursor);
    });

    app.delete("/housenest/api/v1/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollections.deleteOne(query);
      res.send(result);
    });

    app.delete("/housenest/api/v1/review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await UserReviewCollections.deleteOne(query);
      res.send(result);
    });

    app.post("/housenest/api/v1/addproperty", async (req, res) => {
      const body = req.body;
      const result = await addPropertyCollections.insertOne(body);
      res.send(result);
    });

    app.get("/housenest/api/v1/addproperty/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const cursor = await addPropertyCollections.findOne(query);
      res.send(cursor);
    });

    app.delete("/housenest/api/v1/addproperty/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addPropertyCollections.deleteOne(query);
      res.send(result);
    });

    app.patch("/housenest/api/v1/addproperty/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateProperty = await req.body;
      const updateItem = {
        $set: {
          title: updateProperty.title,
          img: updateProperty.img,
          location: updateProperty.location,
          email: updateProperty.email,
          agent: updateProperty.agent,
          price: updateProperty.price,
        },
      };
      const result = await addPropertyCollections.updateOne(filter, updateItem);
      res.send(result);
    });

    app.post("/housenest/api/v1/allproperties", async (req, res) => {
      const body = req.body;
      const result = await allPropertiesCollections.insertOne(body);
      res.send(result);
    });

    app.get("/housenest/api/v1/allproperties", async (req, res) => {
      const result = await allPropertiesCollections.find().toArray();
      res.send(result);
    });

    app.patch("/housenest/api/v1/allproperties/text/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          text: "verify",
        },
      };
      const result = await allPropertiesCollections.updateOne(
        filter,
        updateDoc
      );
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

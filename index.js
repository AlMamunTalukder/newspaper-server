const express = require("express");
const cors = require("cors");
var jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
//middelwares
app.use(cors());
app.use(express.json());
//---------------------------
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zelauzs.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const newsCollection = client.db("newspaperDB").collection("articles");
    const publisherCollection = client
      .db("newspaperDB")
      .collection("publishers");
    const userCollection = client.db("newspaperDB").collection("users");
    //------------user----------------
    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log("New Publisher", user);
      //insert email if user doesn't exists: you can do this many ways (1. email unique, 2. upsert, 3. db checking)
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    //show user
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const result = await userCollection.find({ email: email }).toArray();
      res.send(result);
    });

    //-----------------------Publisher-----------------------------

    //Add Publisher
    app.post("/publishers", async (req, res) => {
      const newPublisher = req.body;
      console.log("New Publisher", newPublisher);
      const result = await publisherCollection.insertOne(newPublisher);
      res.send(result);
    });
    //show publisher
    app.get("/publishers", async (req, res) => {
      const result = await publisherCollection.find().toArray();
      res.send(result);
    });

    //----------------------Articles-------------------------------
    //insert Articles
    app.post("/articles", async (req, res) => {
      const newsArticles = req.body;
      console.log("News Articles", newsArticles);
      const result = await newsCollection.insertOne(newsArticles);
      res.send(result);
    });

    //get
    app.get("/articles", async (req, res) => {
      const result = await newsCollection.find().toArray();
      const sortedArticles = result.sort((a, b) => b.viewCount - a.viewCount);
      res.send(sortedArticles);
    });

    app.get("/article/status/:status", async (req, res) => {
      const status = req.params.status;
      const result = await newsCollection
        .find({ status })
        .sort({ viewCount: -1 })
        .toArray();

      res.send(result);
    });

    app.get("/article/status/premium", async (req, res) => {
      const result = await newsCollection.find({ status: "premium" }).toArray();
      console.log("Premium Articles:", result);
      res.send(result);
    });

    //for show details
    app.get("/articles/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await newsCollection.findOne(query);
      res.send(result);
      console.log(id);
    });

    app.post("/articles/incrementView/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await newsCollection.updateOne(query, {
        $inc: { viewCount: 1 },
      });
      res.send(result);
    });

    //show myarticles
    app.get("/article/:email", async (req, res) => {
      const publisherEmail = req.params.email;
      const result = await newsCollection
        .find({
          publisherEmail,
        })
        .toArray();
      res.send(result);
    });

    app.get("/article/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await newsCollection.findOne(query);
      res.send(result);
      console.log(id);
    });

    //update
    app.get("/article/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await newsCollection.findOne(query);
      res.send(result);
    });

    app.put("/article/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };

      const options = { upsert: true };
      const updateArticle = req.body;
      const article = {
        $set: {
          title: updateArticle.title,
          image: updateArticle.image,
          tags: updateArticle.tags,
          description: updateArticle.description,
        },
      };
      const result = await newsCollection.updateOne(filter, article, options);
      res.send(result);
    });

    //update dashboard status -
    app.put("/article/approved/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const update = { $set: { status: "approved" } };

      const result = await newsCollection.updateOne(filter, update);
      res.send(result);
    });
    //update dashboard status -
    app.put("/article/premium/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const update = { $set: { status: "premium" } };

      const result = await newsCollection.updateOne(filter, update);
      res.send(result);
    });
    //delete
    app.delete("/article/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await newsCollection.deleteOne(query);
      res.send(result);
    });

    //-----------------------------------------------------

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

//-------------------
app.get("/", (req, res) => {
  res.send("Newspaper server is running");
});
app.listen(port, () => {
  console.log(`Newspaper listening on port ${port}`);
});

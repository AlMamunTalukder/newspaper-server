const express = require("express");
const cors = require("cors");
var jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
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
    //-----------------------Publisher-----------------------------
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

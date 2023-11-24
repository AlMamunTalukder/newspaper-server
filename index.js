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

const coffeeCollection = client.db("newspaperDB").collection("");

//-------------------
app.get("/", (req, res) => {
  res.send("Newspaper server is running");
});
app.listen(port, () => {
  console.log(`Newspaper listening on port ${port}`);
});

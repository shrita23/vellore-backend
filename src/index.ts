import "dotenv/config";
import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGO || "";

const client = new MongoClient(uri);
const db = client.db("velloremern");

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", async (req, res) => {
  return res.json({ message: "Hello, World ✌️" });
});

app.get("/samples", async (req, res) => {
  await client.connect();

  const db = client.db("velloremern");
  const collection = db.collection("sample");
  const allSamples = await collection.find({}).toArray();
  return res.status(200).json(allSamples);
});

app.get("/samples/:id", async (req, res) => {
  const { id } = req.params;
  const collection = db.collection("sample");
  // @ts-ignore
  const sample = await collection.findOne({ _id: new ObjectId(id) });
  return res.status(200).json(sample);
});

app.get("/search", async (req, res) => {
  const collection = db.collection("sample");

  try {
    const searchKeyword = req.query.query; // Get the search keyword from the query parameter "query"

    if (!searchKeyword) {
      return res.status(400).json({ error: "Search keyword is required" });
    }

    // Perform search based on the search keyword
    const searchResults = await collection
      .find({
        $or: [
          { name: { $regex: searchKeyword, $options: "i" } }, // Case-insensitive search on the "name" field
          { description: { $regex: searchKeyword, $options: "i" } }, // Case-insensitive search on the "description" field
          // Add more fields as needed for searching
        ],
      })
      .toArray();

    return res.status(200).json(searchResults);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(process.env.PORT || 3000, () =>
  console.log(`Server started on port ${process.env.PORT || 3000}`)
);

export default app;

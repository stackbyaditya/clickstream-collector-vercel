import { MongoClient } from "mongodb";

let client;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const uri = process.env.MONGODB_URI;

    if (!client) {
      client = new MongoClient(uri);
      await client.connect();
    }

    const db = client.db(process.env.MONGODB_DB || "clickstreamdb");

    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    await db.collection("clickstream").insertOne({
      ...body,
      createdAt: new Date(),
    });

    return res.status(204).end();
  } catch (err) {
    console.error("collector error:", err);
    return res.status(500).json({ error: err.message });
  }
}
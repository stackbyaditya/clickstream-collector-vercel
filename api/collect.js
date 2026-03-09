
// Vercel Serverless Function - /api/collect
const { MongoClient } = require('mongodb');
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');

const MONGO_URI = process.env.MONGODB_URI;
const MONGO_DB = process.env.MONGODB_DB || 'clickstreamdb';

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) return { client: cachedClient, db: cachedDb };
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(MONGO_DB);
  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

function parseDevice(req) {
  const ua = new UAParser(req.headers['user-agent'] || '');
  const result = ua.getResult();
  return {
    userAgent: req.headers['user-agent'] || '',
    browser: result.browser.name || 'unknown',
    os: result.os.name || 'unknown',
    deviceType: result.device.type || 'desktop'
  };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const geo = geoip.lookup(ip);
    const device = parseDevice(req);

    const payload = req.body;

    const record = {
      receivedAt: Date.now(),
      ipAddress: ip,
      geoLocation: geo ? geo.country : 'unknown',
      device,
      payload
    };

    // store to MongoDB
    if (!MONGO_URI) {
      console.warn('MONGODB_URI not set. Record will not be persisted to database.');
    } else {
      const { db } = await connectToDatabase();
      await db.collection('clickstream').insertOne(record);
    }

    return res.status(204).end();
  } catch (err) {
    console.error('collector error', err);
    return res.status(500).json({ error: 'server error' });
  }
};

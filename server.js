
// Local express server for testing (not used on Vercel).
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');
const { v4: uuidv4 } = require('uuid');
const { MongoClient } = require('mongodb');

require('dotenv').config();

const app = express();
app.use(bodyParser.json({limit:'2mb'}));
app.use(express.static('public'));

const MONGO_URI = process.env.MONGODB_URI || '';
const MONGO_DB = process.env.MONGODB_DB || 'clickstreamdb';

let mongoClient;

async function getDb(){
  if(!mongoClient){
    mongoClient = new MongoClient(MONGO_URI);
    await mongoClient.connect();
  }
  return mongoClient.db(MONGO_DB);
}

function parseDevice(req){
  const ua = new UAParser(req.headers['user-agent']);
  const result = ua.getResult();
  return {
    userAgent: req.headers['user-agent'],
    browser: result.browser.name || 'unknown',
    os: result.os.name || 'unknown',
    deviceType: result.device.type || 'desktop'
  };
}

app.post('/collect', async (req,res)=>{
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const geo = geoip.lookup(ip);
    const device = parseDevice(req);

    const payload = req.body;
    const record = {
      _id: uuidv4(),
      receivedAt: Date.now(),
      ipAddress: ip,
      geoLocation: geo ? geo.country : 'unknown',
      device,
      payload
    };

    // Save to file (for quick local debug)
    fs.appendFileSync("data/clickstream.jsonl", JSON.stringify(record) + "\n");

    // Save to MongoDB if configured
    if(MONGO_URI){
      const db = await getDb();
      await db.collection('clickstream').insertOne(record);
    }

    res.status(204).end();
  } catch(err){
    console.error(err);
    res.status(500).json({error: 'server error'});
  }
});

app.listen(3000, ()=>{ console.log('Local server running at http://localhost:3000'); });
